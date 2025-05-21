const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// TODO: ajouter un middleware d'authentification pour sécuriser la route
router.get('/me', auth.verifyToken, userController.getMe);
router.put('/me', auth.verifyToken, userController.updateMe);

module.exports = router; 