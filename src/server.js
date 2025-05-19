const app = require('./app');
const PORT = 5000;

// Gestion des erreurs non capturées
process.on('uncaughtException', (err) => {
  console.error('Erreur non capturée:', err);
});

// Gestion des rejets de promesses non capturés
process.on('unhandledRejection', (err) => {
  console.error('Promesse rejetée non capturée:', err);
});

const server = app.listen(PORT, () => {
  console.log(`Serveur backend démarré sur http://localhost:${PORT}`);
  console.log('Routes disponibles:');
  console.log('- POST /api/auth/login');
  console.log('- POST /api/auth/inscription-client');
});

// Gestion des erreurs du serveur
server.on('error', (err) => {
  console.error('Erreur du serveur:', err);
});
