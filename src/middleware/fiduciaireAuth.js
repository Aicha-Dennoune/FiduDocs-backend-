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

    // Vérifier si l'utilisateur est un fiduciaire
    const query = `
      SELECT u.Id, u.Role
      FROM Utilisateur u
      WHERE u.Id = ? AND u.Role = 'Fiduciaire'
    `;

    db.query(query, [decoded.id], (err, results) => {
      if (err) {
        console.error('Erreur lors de la vérification du rôle:', err);
        return res.status(500).json({ message: 'Erreur serveur' });
      }

      if (results.length === 0) {
        console.log('Utilisateur non autorisé');
        return res.status(403).json({ message: 'Accès non autorisé' });
      }

      req.user = decoded;
      next();
    });
  } catch (err) {
    console.error('Erreur de vérification du token:', err);
    return res.status(401).json({ message: 'Token invalide' });
  }
}; 