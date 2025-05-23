const Message = require('../models/Message');

// Liste des clients ayant échangé avec le fiduciaire
exports.getClients = (req, res) => {
  const fiduciaireId = req.user.id; // à adapter selon votre middleware d'auth
  Message.getClientsForFiduciaire(fiduciaireId, (err, clients) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json(clients);
  });
};

// Messages entre le fiduciaire et un client
exports.getMessages = (req, res) => {
  const fiduciaireId = req.user.id; // à adapter selon votre middleware d'auth
  const clientId = req.params.clientId;
  Message.getMessagesBetween(fiduciaireId, clientId, (err, messages) => {
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