const db = require('../config/db');

const Document = {
  countDocuments: (userId, userType, callback) => {
    // userType: 'client' ou 'fiduciaire'
    let sql, params;
    if (userType === 'client') {
      sql = `SELECT 
        SUM(CASE WHEN Type = 'posé' THEN 1 ELSE 0 END) AS postes,
        SUM(CASE WHEN Type = 'reçu' THEN 1 ELSE 0 END) AS recus
        FROM Document WHERE ClientId = ?`;
      params = [userId];
    } else {
      sql = `SELECT 
        SUM(CASE WHEN Type = 'posé' THEN 1 ELSE 0 END) AS postes,
        SUM(CASE WHEN Type = 'reçu' THEN 1 ELSE 0 END) AS recus
        FROM Document WHERE Fiduciaire = ?`;
      params = [userId];
    }
    db.query(sql, params, (err, results) => {
      if (err) return callback(err);
      callback(null, results[0]);
    });
  }
};

module.exports = Document; 