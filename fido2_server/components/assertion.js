import pkg from 'node-jose'; // 導入 node-jose 作為一個 package
import fs from 'fs';          // 導入 fs 模組
import path from 'path';      // 導入 path 模組
import jwt from 'jsonwebtoken'; // 導入 jsonwebtoken 模組
const { JWE, JWK } = pkg;    // 解構提取 JWE 和 JWK

async function CreateToken(id ,user) {
    // 使用私鑰簽發 JWT token
    // Private Key
    const privateKeyPath = path.join(process.cwd(), 'APP_DATA/privateKey.pem').toString();
    const privateKey = fs.readFileSync(privateKeyPath);
    const token = jwt.sign({ 
        sub: id,              // 使用者的唯一 ID（例如：user.id）
        username: user.username,    // 自定義欄位：使用者名稱
        iss: 'https://fido2-server',  // JWT 的簽發者 (issuer)
        aud: 'https://backend',  // JWT 的接收者 (audience)
        iat: Math.floor(Date.now() / 1000), // 簽發時間 (Issued at)
        exp: Math.floor(Date.now() / 1000) + (60 * 60) // 過期時間 (Expires in 1 hour)
    
    }, privateKey, { algorithm: 'RS256' });

    console.log(token); // 輸出 JWT token

    // 讀取並將 PEM 格式的公鑰轉換為 JWK 格式
    const publicKeyPem = fs.readFileSync(path.join(process.cwd(), 'APP_DATA/encryptKey.pem')).toString();
    const encryptionKey = await JWK.asKey(publicKeyPem, 'pem');  // 將 PEM 格式密鑰轉換為 JWK

    // 使用公鑰對 JWT token 進行加密
    const encryptedToken = JWE.createEncrypt({ format: 'compact' }, encryptionKey)
                              .update(token)
                              .final();
    return encryptedToken;
}
export default CreateToken;