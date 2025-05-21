const db = require('../config/db');
const path = require('path');

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
    SELECT fichier as nomFichier, fichier as cheminFichier
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
    const filePath = path.join(__dirname, '../../uploads/documents', document.cheminFichier);
    res.download(filePath, document.nomFichier);
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
      console.error('Erreur lors de la récupération des documents posés:', error);
      return res.status(500).json({ message: 'Erreur lors de la récupération des documents' });
    }
    res.json(results);
  });
};

module.exports = {
  getDocumentsRecus,
  downloadDocument,
  getDocumentsPoses
}; 