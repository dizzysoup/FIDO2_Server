
import express from "express";
import { server } from '@passwordless-id/webauthn'
import dotenv from 'dotenv' ; 
dotenv.config();
import pool from '../db/db.js';
import CreateAssertion from "../components/assertion.js";

async function executeQuery(query, params) {
	let conn;
	try {
		conn = await pool.getConnection();
		const [rows] = await conn.execute(query, params);
		return rows;
	} catch (err) {
		console.error('Query execution error:', err);
		throw err;
	} finally {
		if (conn) {
			await conn.release();
		}
	}
  }
 

var router = express.Router();

router.get('/' , async function(req,res){
	res.send("WebAuth is work ");
})

// Get challenge 
router.get('/challenge' , async function(req , res ){
	
	//const base64urlChallenge = server.randomChallenge()
	const base64urlChallenge  = "6LBb0WByv9yB2xobAIVBIQ"
	process.env.CHALLENGE = base64urlChallenge ; 
	console.log("Get challenge:" , base64urlChallenge);
	return res.send(base64urlChallenge);
})

// Get credentials ID 
router.post('/id', async function(req , res){
	let sql = "select id from credentials where username = (?)"
	const id = await executeQuery(sql , [req.body.username]);
	console.log("id:" , id);
	if(id.length == 0){
		return res.status(401).send({"error" : "查無此帳號"});
	}else 
		return res.status(200).send(JSON.stringify(id));
})

/* 註冊 */
router.post('/register', async function(req, res) {
	try {
		if (!req.body) {
            return res.status(400).send("請求體為空，無法處理");
        }
		const expected = {
			challenge : req.body.challenge,
			origin : "*"
		}
		const registration = req.body ; 
		console.log(" stored Challenge : " ,  process.env.CHALLENGE);	
		
		const registrationParsed = await server.verifyRegistration(registration.data, expected);
		console.log("registrationParsed:" , registrationParsed);	
		const id = registrationParsed.credential.id ; 
		const publicKey = registrationParsed.credential.publicKey;
		const algorithm = registrationParsed.credential.algorithm;
		const username = registration.username;
		const userInfo = registration.userInfo;
	
		console.log("username" , username);
		
		let  sql = "select * from users where username = (?)"
		const chk = await executeQuery(sql, [username]);
		
		if(chk.length == 0 ){
			await executeQuery("INSERT INTO users(username,info) values(?,?)" , [username,userInfo]);
			await executeQuery('INSERT INTO  credentials(username,id,publicKey,algo) values(?,?,?,?);', [username,id,publicKey,algorithm]);		
			res.status(200).send(registrationParsed);
		}else {
			res.status(401).send("帳號已註冊");
		}
	}catch (error){
		console.log("處理註冊請求時發生錯誤:" , error);
		res.status(500).send("伺服器內部錯誤");
	}
	
	
});


// 登入
router.post("/login", async (req, res) => {
	const username = req.body.username;
	const authentication = req.body.data ;

	console.log("authentication:" , authentication);

	const expected = {
		challenge: process.env.CHALLENGE,
		origin: "*",
		userVerified: true
		
	}

	let sql = "select id , publicKey, algo as algorithm  from credentials where username = (?)";
	const credentialKey = await executeQuery(sql, [username]);
	const credentialKeyJson = {
		id : credentialKey[0].id ,
		publicKey : credentialKey[0].publicKey , 
		algorithm : credentialKey[0].algorithm
	};

	try {
		console.log("credentialKey:" , credentialKeyJson);
		const authenticationParsed = await server.verifyAuthentication(authentication, credentialKeyJson, expected)
		console.log("authenticationParsed:" , authenticationParsed);
		const assertion =  await CreateAssertion(credentialKey[0].id,username);
		console.log("assertion:" , assertion);
		if (authenticationParsed !== undefined){
			res.status(200).send({
				message : "登入成功",
				assertion: assertion
			});
		}else {
			res.status(401).send({
				message : "登入失敗" ,
				assertion : null
			});
		}
	}catch (error){
		console.log("error:" , error);
		res.status(500).send({
			message : "伺服器錯誤" ,
			assertion : error
		});
	}	
});
export default router ;

