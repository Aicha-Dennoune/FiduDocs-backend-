const Message = require('../models/Message');

// Liste des clients ayant échangé avec le fiduciaire
exports.getClients = (req, res) => {
  const fiduciaireId = req.user.id; // à adapter selon votre middleware d'auth
  Message.getClientsForFiduciaire(fiduciaireId, (err, clients) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json(clients);
  });
};

// Messages entre le fiduciaire et un client OU entre le client et son fiduciaire
exports.getMessages = (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role?.toLowerCase();
  const otherId = req.params.clientId;
  let idA, idB;
  if (userRole === 'client') {
    // L'utilisateur est un client, il veut voir la conversation avec son fiduciaire (otherId)
    idA = userId; // client
    idB = otherId; // fiduciaire
  } else {
    // L'utilisateur est un fiduciaire, il veut voir la conversation avec un client (otherId)
    idA = userId; // fiduciaire
    idB = otherId; // client
  }
  Message.getMessagesBetween(idA, idB, (err, messages) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json(messages);
  });
};

// Envoyer un message
exports.sendMessage = (req, res) => {
  const { contenu, destinataire } = req.body;
  const expediteur = req.user.id; // à adapter selon votre middleware d'auth
  if (!contenu || !destinataire) return res.status(400).json({ error: 'Champs manquants' });
  Message.create(contenu, expediteur, destinataire, (err, message) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json(message);
  });
};

// Liste de tous les clients (même sans message)
exports.getAllClients = (req, res) => {
  Message.getAllClients((err, clients) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json(clients);
  });
};

// Compter les messages non lus pour le client connecté
exports.countUnreadForClient = (req, res) => {
  const fiduciaireId = req.user.id;
  const clientId = req.params.clientId;
  const sql = `
    SELECT COUNT(*) AS unreadCount
    FROM Message
    WHERE Destinataire = ? AND Expediteur = ? AND EstLu = 0
  `;
  const db = require('../config/db');
  db.query(sql, [fiduciaireId, clientId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json({ unread: rows[0].unreadCount });
  });
};

// Marquer tous les messages reçus par le client comme lus
exports.markAllAsReadForClient = (req, res) => {
  const clientId = req.user.id;
  const sql = `
    UPDATE Message
    SET EstLu = 1
    WHERE Destinataire = ? AND EstLu = 0
  `;
  const db = require('../config/db');
  db.query(sql, [clientId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json({ success: true, affectedRows: result.affectedRows });
  });
};

// Compter les messages non lus pour le fiduciaire (de tous les clients)
exports.countUnreadForFiduciaire = (req, res) => {
  const fiduciaireId = req.user.id;
  const sql = `
    SELECT COUNT(*) AS unreadCount
    FROM Message
    WHERE Destinataire = ? AND EstLu = 0
  `;
  const db = require('../config/db');
  db.query(sql, [fiduciaireId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json({ unread: rows[0].unreadCount });
  });
};

// Marquer comme lus les messages d'un client spécifique pour le fiduciaire
exports.markClientMessagesAsRead = (req, res) => {
  const fiduciaireId = req.user.id;
  const clientId = req.params.clientId;
  const sql = `
    UPDATE Message
    SET EstLu = 1
    WHERE Destinataire = ? AND Expediteur = ? AND EstLu = 0
  `;
  const db = require('../config/db');
  db.query(sql, [fiduciaireId, clientId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json({ success: true, affectedRows: result.affectedRows });
  });
}; 