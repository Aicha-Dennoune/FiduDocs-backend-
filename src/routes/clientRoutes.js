const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const auth = require('../middleware/auth');

// Route pour récupérer les informations du client connecté
router.get('/me', auth, clientController.getMe);

// Route pour récupérer un client spécifique
router.get('/:id', auth, clientController.getClient);

// Route pour mettre à jour un client
router.put('/:id', auth, clientController.updateClient);

module.exports = router; 