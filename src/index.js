const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import des routes
const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/client');
const fiduciaireRoutes = require('./routes/fiduciaire');
const documentRoutes = require('./routes/document');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/fiduciaires', fiduciaireRoutes);
app.use('/api/documents', documentRoutes);

// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).json({ message: 'Route non trouvée' });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Erreur serveur' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
}); 