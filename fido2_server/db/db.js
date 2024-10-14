import mysql from 'mysql2/promise';

// fido2-db
const pool = mysql.createPool({
    host: 'fido2-db',
    user: 'user',
    password: 'password',
    database: 'fidodb'
});

export default  pool ; 