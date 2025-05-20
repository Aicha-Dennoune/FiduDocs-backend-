const jwt = require('jsonwebtoken');

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
    console.log('Tentative de vérification du token avec la clé:', 'votre_secret_jwt');
    const decoded = jwt.verify(token, 'votre_secret_jwt');
    console.log('Token décodé:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Erreur de vérification du token:', err);
    return res.status(401).json({ message: 'Token invalide' });
  }
}; 