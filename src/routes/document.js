const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

console.log('typeof fiduciaireAuth:', typeof auth);
console.log('typeof getDocumentsPoses:', typeof documentController.getDocumentsPoses);

// Routes pour les documents
router.get('/poses', auth.verifyToken, documentController.getDocumentsPoses);
router.get('/recus', auth.verifyToken, documentController.getDocumentsRecus);
router.get('/clients', auth.verifyToken, documentController.getClientsList);
router.post('/', auth.verifyToken, upload.single('fichier'), documentController.addDocument);
router.get('/download/:id', auth.verifyToken, documentController.downloadDocument);
router.delete('/:id', auth.verifyToken, documentController.deleteDocument);

module.exports = router; 