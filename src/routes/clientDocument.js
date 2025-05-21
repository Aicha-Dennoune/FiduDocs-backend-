const express = require('express');
const router = express.Router();
const { verifyToken, isClient } = require('../middleware/auth');
const { getDocumentsRecus, downloadDocument, getDocumentsPoses } = require('../controllers/clientDocumentController');

// Route pour récupérer les documents posés par le client
router.get('/poses', verifyToken, isClient, getDocumentsPoses);

// Route pour récupérer les documents reçus
router.get('/recus', verifyToken, isClient, getDocumentsRecus);

// Route pour télécharger un document
router.get('/:id/download', verifyToken, isClient, downloadDocument);

module.exports = router; 