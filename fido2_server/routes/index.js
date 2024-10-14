
import express from 'express';
import pool from '../db/db.js';
var router = express.Router();

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


router.post('/delete/credential/:id', async function(req, res){
  const sql = 'DELETE FROM credentials WHERE id = ?';
  const id = req.params.id;
  await executeQuery(sql, [id]);
  res.redirect('/'); // 刪除成功後重定向到首頁 
});

router.post('/delete-all/credentials', async (req, res) => {
  let con = await pool.getConnection(); 
  const sql = 'DELETE FROM credentials';
  await con.query(sql);
  if(con) await con.end();
  res.redirect('/');
});

router.post('/delete-all/users', async (req, res) => {
  const sql = 'DELETE FROM users';
  await executeQuery(sql);
  res.redirect('/');
});

router.post('/delete/user/:username', async (req, res) => {
  const sql = 'DELETE FROM users WHERE username = ?';
  const username = req.params.username;
  await executeQuery(sql, [username]);
  res.redirect('/');
});


/* GET home page. */
router.get('/', async function(req, res, next) {
  const credentialsQuery = 'SELECT * FROM credentials';
  const usersQuery = 'SELECT * FROM users';

  
  const users = await executeQuery(usersQuery);
  const credentials = await executeQuery(credentialsQuery);
  console.log('users', users);
  console.log('credentials', credentials);
  res.render('index', { credentials, users });
});
export default router ;

