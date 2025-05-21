const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const clientAuth = require('../middleware/clientAuth');
const fiduciaireAuth = require('../middleware/fiduciaireAuth');

// Routes accessibles aux clients pour leur propre profil
router.get('/me', clientAuth, clientController.getMe);
router.put('/me', clientAuth, clientController.updateMe);

// Routes accessibles uniquement aux fiduciaires
router.get('/', fiduciaireAuth, clientController.getAllClients);
router.get('/:id', fiduciaireAuth, clientController.getClient);
router.put('/:id', fiduciaireAuth, clientController.updateClient);

module.exports = router; 