const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'fidu',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Convertir le pool en promesses pour utiliser async/await
const promisePool = pool.promise();

module.exports = pool; 