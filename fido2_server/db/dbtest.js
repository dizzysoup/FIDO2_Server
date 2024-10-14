import pool from './db.js';



async function CreateConnection() {
    try {
        conn = await pool.getConnection();
     
        const rows =  await con.query('select 1 ');
        console.log(rows);
        // 關閉連接
        con.end()

      } catch (error) {
        console.error('連接數據庫時出現錯誤：', error)
      }
}

export default CreateConnection ;

CreateConnection();