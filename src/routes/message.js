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
// Retourner le nombre de messages non lus pour le client connecté
router.get('/unread/client', verifyToken, messageController.countUnreadForClient);
// Retourner le nombre de messages non lus d'un client spécifique pour le fiduciaire
router.get('/unread/client/:clientId', verifyToken, messageController.countUnreadForClient);
// Retourner le nombre de messages non lus pour le fiduciaire
router.get('/unread/fiduciaire', verifyToken, messageController.countUnreadForFiduciaire);
// Marquer tous les messages du client comme lus
router.post('/read/client', verifyToken, messageController.markAllAsReadForClient);
// Marquer comme lus les messages d'un client spécifique pour le fiduciaire
router.post('/read/client/:clientId', verifyToken, messageController.markClientMessagesAsRead);

module.exports = router; 