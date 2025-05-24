const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Middleware pour logger les requêtes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Import des routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const clientRoutes = require('./routes/client');
const documentRoutes = require('./routes/document');
const rendezvousRoutes = require('./routes/rendezvous');

// Montage des routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/rendezvous', rendezvousRoutes);

// Middleware pour servir les fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Gestion des erreurs 404
app.use((req, res) => {
  console.log('Route non trouvée:', req.method, req.url);
  res.status(404).json({ message: 'Route non trouvée' });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err.stack);
  res.status(500).json({ message: 'Erreur serveur' });
});

module.exports = app;
