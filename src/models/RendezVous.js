const db = require('../config/db');

const RendezVous = {
  create: (data, callback) => {
    const sql = `INSERT INTO RendezVous (Date, Heure, Statut, Type, Description, ClientId, FiduciaireId)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [
      data.date, data.heure, data.statut, data.type, data.description, data.clientId, data.fiduciaireId
    ], callback);
  },
  getByClient: (clientId, callback) => {
    db.query('SELECT * FROM RendezVous WHERE ClientId = ? ORDER BY Date DESC, Heure DESC', [clientId], callback);
  },
  delete: (id, clientId, callback) => {
    db.query('DELETE FROM RendezVous WHERE Id = ? AND ClientId = ?', [id, clientId], callback);
  },
  getByFiduciaire: (fiduciaireId, callback) => {
    db.query(
      `SELECT r.*, u.Nom as ClientNom, u.Prenom as ClientPrenom
       FROM RendezVous r
       JOIN Client c ON r.ClientId = c.Id
       JOIN Utilisateur u ON c.Id = u.Id
       WHERE r.FiduciaireId = ?
       ORDER BY r.Date DESC, r.Heure DESC`,
      [fiduciaireId],
      callback
    );
  },
  updateStatut: (id, fiduciaireId, statut, callback) => {
    db.query('UPDATE RendezVous SET Statut = ? WHERE Id = ? AND FiduciaireId = ?', [statut, id, fiduciaireId], callback);
  }
};

module.exports = RendezVous; 