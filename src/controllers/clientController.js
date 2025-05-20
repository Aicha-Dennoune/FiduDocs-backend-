const db = require('../config/db');

exports.getAllClients = (req, res) => {
  // Requête pour récupérer tous les clients avec leurs infos spécifiques
  const sql = `
    SELECT u.Id, u.Nom, u.Prenom, u.Email, u.Tele, c.TypeClient,
      cp.Adresse AS AdresseParticulier,
      ce.NomEntreprise, ce.AdresseEntreprise
    FROM Utilisateur u
    INNER JOIN Client c ON u.Id = c.Id
    LEFT JOIN ClientParticulier cp ON c.Id = cp.Id
    LEFT JOIN ClientEntreprise ce ON c.Id = ce.Id
    ORDER BY u.Nom, u.Prenom
  `;
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la récupération des clients', details: err.message });
    }
    res.json(results);
  });
}; 