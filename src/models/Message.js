const db = require('../config/db');

const Message = {
  // Récupérer tous les clients ayant échangé avec le fiduciaire
  getClientsForFiduciaire: (fiduciaireId, callback) => {
    const sql = `
      SELECT DISTINCT u.Id, u.nom, u.prenom, u.PhotoProfil
      FROM Utilisateur u
      INNER JOIN Message m ON (u.Id = m.Expediteur OR u.Id = m.Destinataire)
      WHERE (m.Expediteur = ? OR m.Destinataire = ?) AND LOWER(u.role) = 'client'
      ORDER BY u.nom, u.prenom
    `;
    db.query(sql, [fiduciaireId, fiduciaireId], (err, result) => {
      if (err) {
        console.error('Erreur SQL getClientsForFiduciaire:', err.sqlMessage || err.message || err);
      }
      callback(err, result);
    });
  },

  // Récupérer tous les messages entre le fiduciaire et un client
  getMessagesBetween: (fiduciaireId, clientId, callback) => {
    const sql = `
      SELECT m.*, u1.prenom as expediteurPrenom, u1.nom as expediteurNom
      FROM Message m
      JOIN Utilisateur u1 ON m.Expediteur = u1.Id
      WHERE (m.Expediteur = ? AND m.Destinataire = ?) OR (m.Expediteur = ? AND m.Destinataire = ?)
      ORDER BY m.Id ASC
    `;
    db.query(sql, [fiduciaireId, clientId, clientId, fiduciaireId], callback);
  },

  // Envoyer un message
  create: (contenu, expediteur, destinataire, callback) => {
    const sql = 'INSERT INTO Message (Contenu, Expediteur, Destinataire) VALUES (?, ?, ?)';
    db.query(sql, [contenu, expediteur, destinataire], (err, result) => {
      if (err) return callback(err);
      // Retourner le message inséré
      db.query('SELECT * FROM Message WHERE Id = ?', [result.insertId], (err2, rows) => {
        if (err2) return callback(err2);
        callback(null, rows[0]);
      });
    });
  },

  // Récupérer tous les clients (même sans message)
  getAllClients: (callback) => {
    const sql = `
      SELECT Id, nom, prenom, PhotoProfil
      FROM Utilisateur
      WHERE LOWER(role) = 'client'
      ORDER BY nom, prenom
    `;
    db.query(sql, callback);
  }
};

module.exports = Message; 