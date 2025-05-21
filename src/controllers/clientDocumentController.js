const db = require('../config/db');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Récupérer les documents reçus par le client (posés par le fiduciaire)
const getDocumentsRecus = (req, res) => {
  const clientId = req.user.id;

  const query = `
    SELECT 
      d.Id,
      d.description,
      d.TypeDocument as type,
      d.date,
      d.fichier as nomFichier,
      CONCAT(u.Nom, ' ', u.Prenom) as nomFiduciaire
    FROM Document d
    JOIN Fiduciaire f ON d.Fiduciaire = f.Id
    JOIN Utilisateur u ON f.Id = u.Id
    WHERE d.ClientId = ? AND d.Type = 'posé'
    ORDER BY d.date DESC
  `;

  db.query(query, [clientId], (error, results) => {
    if (error) {
      console.error('Erreur lors de la récupération des documents reçus:', error);
      return res.status(500).json({ message: 'Erreur lors de la récupération des documents' });
    }
    res.json(results);
  });
};

// Télécharger un document
const downloadDocument = (req, res) => {
  const documentId = req.params.id;
  const clientId = req.user.id;

  // Vérifier que le document appartient bien au client
  const query = `
    SELECT fichier
    FROM Document
    WHERE Id = ? AND ClientId = ?
  `;

  db.query(query, [documentId, clientId], (error, results) => {
    if (error) {
      console.error('Erreur lors de la vérification du document:', error);
      return res.status(500).json({ message: 'Erreur lors de la vérification du document' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }

    const document = results[0];
    const filePath = path.join(__dirname, '../../uploads/documents', document.fichier);
    res.download(filePath, document.fichier);
  });
};

// Récupérer les documents posés par le client
const getDocumentsPoses = (req, res) => {
  const clientId = req.user.id;
  const query = `
    SELECT 
      d.Id,
      d.description,
      d.TypeDocument as type,
      d.date,
      d.fichier,
      CONCAT(u.Nom, ' ', u.Prenom) as nomFiduciaire
    FROM Document d
    JOIN Fiduciaire f ON d.Fiduciaire = f.Id
    JOIN Utilisateur u ON f.Id = u.Id
    WHERE d.ClientId = ? AND d.Type = 'reçu'
    ORDER BY d.date DESC
  `;
  db.query(query, [clientId], (error, results) => {
    if (error) {
      console.error('Erreur lors de la récupération des documents posés:', error);
      return res.status(500).json({ message: 'Erreur lors de la récupération des documents' });
    }
    res.json(results);
  });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/documents'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Ajouter un document posé par le client (Type = 'reçu')
const addDocument = (req, res) => {
  const clientId = req.user.id;
  const fiduciaireId = 2; // ID du fiduciaire Bamir Laila (à adapter si besoin)
  const { description, type } = req.body;
  const fichier = req.file ? req.file.filename : null;
  const date = new Date();

  console.log('--- Ajout document client ---');
  console.log('description:', description);
  console.log('type (TypeDocument):', type);
  console.log('fichier:', fichier);
  console.log('clientId:', clientId);
  console.log('fiduciaireId:', fiduciaireId);
  console.log('date:', date);

  if (!fichier) {
    console.log('Aucun fichier envoyé');
    return res.status(400).json({ message: 'Aucun fichier envoyé' });
  }

  const query = `
    INSERT INTO Document (description, Type, Fiduciaire, ClientId, fichier, date, TypeDocument)
    VALUES (?, 'reçu', ?, ?, ?, ?, ?)
  `;
  console.log('Requête SQL:', query);
  console.log('Valeurs:', [description, fiduciaireId, clientId, fichier, date, type]);
  db.query(query, [description, fiduciaireId, clientId, fichier, date, type], (error, result) => {
    if (error) {
      console.error('Erreur lors de l\'ajout du document:', error);
      return res.status(500).json({ message: 'Erreur lors de l\'ajout du document', details: error.message });
    }
    res.status(201).json({
      id: result.insertId,
      description,
      type: 'reçu',
      typeDocument: type,
      date,
      fichier,
      fiduciaireId,
      clientId
    });
  });
};

// Supprimer un document posé par le client
const deleteDocument = (req, res) => {
  const documentId = req.params.id;
  const clientId = req.user.id;

  // Vérifier que le document appartient bien au client
  const selectQuery = `SELECT fichier FROM Document WHERE Id = ? AND ClientId = ? AND Type = 'reçu'`;
  db.query(selectQuery, [documentId, clientId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la vérification du document:', err);
      return res.status(500).json({ message: 'Erreur lors de la vérification du document' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Document non trouvé ou non autorisé' });
    }
    const fichier = results[0].fichier;
    const filePath = path.join(__dirname, '../../uploads/documents', fichier);
    // Supprimer le fichier physique
    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        console.error('Erreur lors de la suppression du fichier:', err);
        return res.status(500).json({ message: 'Erreur lors de la suppression du fichier' });
      }
      // Supprimer l'entrée en base
      const deleteQuery = `DELETE FROM Document WHERE Id = ? AND ClientId = ? AND Type = 'reçu'`;
      db.query(deleteQuery, [documentId, clientId], (err) => {
        if (err) {
          console.error('Erreur lors de la suppression du document:', err);
          return res.status(500).json({ message: 'Erreur lors de la suppression du document' });
        }
        res.json({ message: 'Document supprimé avec succès' });
      });
    });
  });
};

module.exports = {
  getDocumentsRecus,
  downloadDocument,
  getDocumentsPoses,
  upload,
  addDocument,
  deleteDocument
}; 