const db = require('../config/db');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

// Récupérer tous les documents posés par le fiduciaire
const getDocumentsPoses = async (req, res) => {
    try {
        const fiduciaireId = req.user.id;
        console.log('Récupération des documents posés pour fiduciaire:', fiduciaireId);
        
        const query = `
            SELECT d.*, 
                   CONCAT(u.Nom, ' ', u.Prenom) as ClientNom,
                   u.Email as ClientEmail,
                   d.TypeDocument as Type
            FROM Document d
            JOIN Client c ON d.ClientId = c.Id
            JOIN Utilisateur u ON c.Id = u.Id
            WHERE d.Fiduciaire = ? AND d.Type = 'posé'
            ORDER BY d.date DESC
        `;
        
        db.query(query, [fiduciaireId], (err, results) => {
            if (err) {
                console.error('Erreur lors de la récupération des documents posés:', err);
                return res.status(500).json({ message: 'Erreur serveur' });
            }
            console.log('Documents posés trouvés:', results);
            res.json(results);
        });
    } catch (error) {
        console.error('Erreur dans getDocumentsPoses:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Récupérer tous les documents reçus par le fiduciaire
const getDocumentsRecus = async (req, res) => {
    try {
        const fiduciaireId = req.user.id;
        console.log('Récupération des documents reçus pour fiduciaire:', fiduciaireId);
        
        const query = `
            SELECT d.*, 
                   CONCAT(u.Nom, ' ', u.Prenom) as ClientNom,
                   u.Email as ClientEmail,
                   d.TypeDocument as Type
            FROM Document d
            JOIN Client c ON d.ClientId = c.Id
            JOIN Utilisateur u ON c.Id = u.Id
            WHERE d.Fiduciaire = ? AND d.Type = 'reçu'
            ORDER BY d.date DESC
        `;
        
        db.query(query, [fiduciaireId], (err, results) => {
            if (err) {
                console.error('Erreur lors de la récupération des documents reçus:', err);
                return res.status(500).json({ message: 'Erreur serveur' });
            }
            console.log('Documents reçus trouvés:', results);
            res.json(results);
        });
    } catch (error) {
        console.error('Erreur dans getDocumentsRecus:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Ajouter un nouveau document
const addDocument = async (req, res) => {
    try {
        const { clientId, description, type } = req.body;
        const fiduciaireId = req.user.id;
        const date = new Date().toISOString().split('T')[0];
        const fichier = req.file ? req.file.filename : null;
        
        console.log('Ajout document:', { clientId, description, type, fiduciaireId, date, fichier });

        const query = `
            INSERT INTO Document (description, Type, TypeDocument, Fiduciaire, ClientId, date, fichier)
            VALUES (?, 'posé', ?, ?, ?, ?, ?)
        `;

        db.query(query, [description, type, fiduciaireId, clientId, date, fichier], (err, result) => {
            if (err) {
                console.error('Erreur lors de l\'ajout du document:', err);
                return res.status(500).json({ message: 'Erreur serveur' });
            }
            console.log('Document ajouté avec succès:', result);
            res.status(201).json({ 
                message: 'Document ajouté avec succès',
                documentId: result.insertId 
            });
        });
    } catch (error) {
        console.error('Erreur dans addDocument:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Télécharger un document
const downloadDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const fiduciaireId = req.user.id;
        console.log('Téléchargement document:', { id, fiduciaireId });

        // Vérifier si l'ID est un nombre (ID de la base de données)
        const documentId = parseInt(id);
        if (isNaN(documentId)) {
            console.log('ID invalide:', id);
            return res.status(400).json({ message: 'ID de document invalide' });
        }

        const query = `
            SELECT * FROM Document 
            WHERE Id = ? AND Fiduciaire = ?
        `;

        db.query(query, [documentId, fiduciaireId], (err, results) => {
            if (err) {
                console.error('Erreur lors de la récupération du document:', err);
                return res.status(500).json({ message: 'Erreur serveur' });
            }

            if (results.length === 0) {
                console.log('Document non trouvé:', { id: documentId, fiduciaireId });
                return res.status(404).json({ message: 'Document non trouvé' });
            }

            const document = results[0];
            if (!document.fichier) {
                console.log('Document sans fichier:', document);
                return res.status(404).json({ message: 'Document sans fichier associé' });
            }

            // Construire le chemin absolu du fichier
            const uploadDir = path.join(__dirname, '../../uploads/documents');
            const filePath = path.join(uploadDir, document.fichier);
            console.log('Chemin du fichier:', filePath);

            // Vérifier si le fichier existe
            if (!fs.existsSync(filePath)) {
                console.log('Fichier physique non trouvé:', filePath);
                return res.status(404).json({ message: 'Fichier non trouvé sur le serveur' });
            }

            // Vérifier les permissions du fichier
            try {
                fs.accessSync(filePath, fs.constants.R_OK);
            } catch (error) {
                console.error('Erreur d\'accès au fichier:', error);
                return res.status(500).json({ message: 'Erreur d\'accès au fichier' });
            }

            // Obtenir les informations sur le fichier
            const stat = fs.statSync(filePath);
            console.log('Taille du fichier:', stat.size, 'octets');

            // Lire le fichier
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    console.error('Erreur lors de la lecture du fichier:', err);
                    return res.status(500).json({ message: 'Erreur lors de la lecture du fichier' });
                }

                // Définir les headers pour le téléchargement
                res.setHeader('Content-Length', stat.size);
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="${document.fichier}"`);
                res.setHeader('Cache-Control', 'no-cache');
                res.setHeader('Pragma', 'no-cache');

                // Envoyer le fichier
                res.send(data);
                console.log('Fichier envoyé avec succès');
            });
        });
    } catch (error) {
        console.error('Erreur dans downloadDocument:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Erreur serveur' });
        }
    }
};

// Supprimer un document
const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const fiduciaireId = req.user.id;
        console.log('Suppression document:', { id, fiduciaireId });

        // Vérifier que le document appartient au fiduciaire
        const checkQuery = `
            SELECT * FROM Document 
            WHERE Id = ? AND Fiduciaire = ?
        `;

        db.query(checkQuery, [id, fiduciaireId], (err, results) => {
            if (err) {
                console.error('Erreur lors de la vérification du document:', err);
                return res.status(500).json({ message: 'Erreur serveur' });
            }

            if (results.length === 0) {
                console.log('Document non trouvé ou non autorisé:', { id, fiduciaireId });
                return res.status(404).json({ message: 'Document non trouvé ou non autorisé' });
            }

            const document = results[0];
            const filePath = path.join(__dirname, '../../uploads/documents', document.fichier);
            console.log('Chemin du fichier à supprimer:', filePath);

            // Supprimer le fichier physique s'il existe
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                    console.log('Fichier physique supprimé:', filePath);
                } catch (error) {
                    console.error('Erreur lors de la suppression du fichier physique:', error);
                }
            } else {
                console.log('Fichier physique non trouvé:', filePath);
            }

            // Supprimer le document de la base de données
            const deleteQuery = `DELETE FROM Document WHERE Id = ?`;
            db.query(deleteQuery, [id], (err, result) => {
                if (err) {
                    console.error('Erreur lors de la suppression du document:', err);
                    return res.status(500).json({ message: 'Erreur serveur' });
                }
                console.log('Document supprimé de la base de données:', result);
                res.json({ message: 'Document supprimé avec succès' });
            });
        });
    } catch (error) {
        console.error('Erreur dans deleteDocument:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Récupérer la liste des clients pour le formulaire
const getClientsList = async (req, res) => {
    try {
        const query = `
            SELECT c.Id, u.Nom, u.Prenom, u.Email
            FROM Client c
            JOIN Utilisateur u ON c.Id = u.Id
            ORDER BY u.Nom, u.Prenom
        `;
        
        db.query(query, (err, results) => {
            if (err) {
                console.error('Erreur lors de la récupération de la liste des clients:', err);
                return res.status(500).json({ message: 'Erreur serveur' });
            }
            console.log('Liste des clients récupérée:', results);
            res.json(results);
        });
    } catch (error) {
        console.error('Erreur dans getClientsList:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

module.exports = {
    getDocumentsPoses,
    getDocumentsRecus,
    addDocument,
    downloadDocument,
    deleteDocument,
    getClientsList
}; 