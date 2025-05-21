const express = require('express');
const router = express.Router();
const { verifyToken, isClient } = require('../middleware/auth');
const { getDocumentsRecus, downloadDocument, getDocumentsPoses, addDocument, upload, deleteDocument } = require('../controllers/clientDocumentController');

// Route pour récupérer les documents posés par le client
router.get('/poses', verifyToken, isClient, getDocumentsPoses);

// Route pour récupérer les documents reçus
router.get('/recus', verifyToken, isClient, getDocumentsRecus);

// Route pour télécharger un document
router.get('/:id/download', verifyToken, isClient, downloadDocument);

// Route pour poser un document (upload)
router.post('/', verifyToken, isClient, upload.single('fichier'), addDocument);

// Route pour supprimer un document posé par le client
router.delete('/:id', verifyToken, isClient, deleteDocument);

module.exports = router; 