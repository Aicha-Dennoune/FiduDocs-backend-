const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const statistiquesController = require('../controllers/statistiquesController');

// Routes protégées
router.get('/me', auth.verifyToken, userController.getMe);
router.put('/me', auth.verifyToken, userController.updateMe);
router.put('/email', auth.verifyToken, userController.changeEmail);
router.put('/password', auth.verifyToken, userController.changePassword);
router.post('/deactivate', auth.verifyToken, userController.deactivateAccount);

// Statistiques documents et rendez-vous
router.get('/statistiques/documents/:userId', auth.verifyToken, statistiquesController.getDocumentsStats);
router.get('/statistiques/rendezvous/:userId', auth.verifyToken, statistiquesController.getRendezVousStats);

module.exports = router; 