const jwt = require('jsonwebtoken');
const db = require('../config/db');

module.exports = (req, res, next) => {
  console.log('Headers reçus:', req.headers);
  const authHeader = req.headers.authorization;
  console.log('Auth header:', authHeader);

  if (!authHeader) {
    console.log('Token manquant dans les headers');
    return res.status(401).json({ message: 'Token manquant' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Token extrait:', token);

  if (!token) {
    console.log('Format du token invalide');
    return res.status(401).json({ message: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'votre_secret_jwt');
    console.log('Token décodé:', decoded);

    // Vérifier si l'utilisateur existe et est un client
    const sql = `
      SELECT u.Id, u.Role, c.Id as ClientId
      FROM Utilisateur u
      LEFT JOIN Client c ON u.Id = c.Id
      WHERE u.Id = ?
    `;

    db.query(sql, [decoded.id], (err, results) => {
      if (err) {
        console.error('Erreur lors de la vérification de l\'utilisateur:', err);
        return res.status(500).json({ message: 'Erreur serveur' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      const user = results[0];
      if (!user.ClientId) {
        return res.status(403).json({ message: 'Accès non autorisé - Utilisateur non client' });
      }

      req.user = {
        id: user.Id,
        role: user.Role
      };
      next();
    });
  } catch (err) {
    console.error('Erreur de vérification du token:', err);
    return res.status(401).json({ message: 'Token invalide' });
  }
}; 