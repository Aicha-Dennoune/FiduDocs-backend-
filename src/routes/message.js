const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { verifyToken } = require('../middleware/auth');

// Liste des clients
router.get('/clients', verifyToken, messageController.getClients);
// Messages avec un client
router.get('/:clientId', verifyToken, messageController.getMessages);
// Envoyer un message
router.post('/', verifyToken, messageController.sendMessage);
// Retourner tous les clients, même sans message
router.get('/all-clients', verifyToken, messageController.getAllClients);

module.exports = router; 