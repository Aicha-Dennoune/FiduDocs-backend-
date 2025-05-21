const jwt = require('jsonwebtoken');
const db = require('../config/db');

const verifyToken = (req, res, next) => {
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
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Erreur de vérification du token:', err);
    return res.status(401).json({ message: 'Token invalide' });
  }
};

const isClient = (req, res, next) => {
  console.log('Rôle utilisateur (isClient):', req.user && req.user.role);
  if (!req.user) {
    return res.status(401).json({ message: 'Non authentifié' });
  }

  if (req.user.role !== 'Client') {
    return res.status(403).json({ message: 'Accès non autorisé' });
  }

  next();
};

module.exports = {
  verifyToken,
  isClient
}; 