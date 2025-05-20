const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'fiducdocs',
});

// Fonction pour vérifier la structure de la base de données
const checkDatabaseStructure = () => {
  // Vérifier si la table Utilisateur existe
  db.query('SHOW TABLES LIKE "Utilisateur"', (err, results) => {
    if (err) {
      console.error('Erreur lors de la vérification des tables:', err);
      return;
    }
    
    if (results.length === 0) {
      console.error('La table Utilisateur n\'existe pas!');
      return;
    }

    // Vérifier la structure de la table Utilisateur
    db.query('DESCRIBE Utilisateur', (err, columns) => {
      if (err) {
        console.error('Erreur lors de la vérification de la structure:', err);
        return;
      }
      console.log('Structure de la table Utilisateur:', columns.map(col => col.Field));
    });
  });
};

// Gestion des erreurs de connexion
db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', {
      message: err.message,
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState
    });
    return;
  }
  console.log('Connexion à la base de données réussie');
  checkDatabaseStructure();
});

// Gestion des erreurs de connexion perdues
db.on('error', (err) => {
  console.error('Erreur de base de données:', {
    message: err.message,
    code: err.code,
    errno: err.errno,
    sqlState: err.sqlState
  });
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Tentative de reconnexion...');
    db.connect();
  } else {
    throw err;
  }
});

module.exports = db;
