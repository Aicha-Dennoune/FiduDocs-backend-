const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'fiducdocs',
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connexion à la base de données réussie');
});

module.exports = db;
