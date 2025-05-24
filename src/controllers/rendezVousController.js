const RendezVous = require('../models/RendezVous');
const db = require('../config/db');

exports.create = (req, res) => {
  const { date, heure, type, description } = req.body;
  const clientId = req.user.id;
  console.log('Données reçues:', { date, heure, type, description, clientId });
  // Récupérer le fiduciaireId du client
  db.query('SELECT FiduciaireId FROM Client WHERE Id = ?', [clientId], (err, results) => {
    if (err) {
      console.error('Erreur SQL lors de la recherche du FiduciaireId:', err);
      return res.status(500).json({ error: 'Erreur serveur', details: err });
    }
    console.log('Résultat SELECT FiduciaireId:', results);
    if (results.length === 0) {
      console.error('Client non trouvé pour Id:', clientId);
      return res.status(404).json({ error: 'Client non trouvé' });
    }
    const fiduciaireId = results[0].FiduciaireId;
    if (!fiduciaireId) {
      console.error('Aucun fiduciaire associé au client:', clientId);
      return res.status(400).json({ error: 'Aucun fiduciaire associé' });
    }
    if (!date || !heure || !type || !description) {
      console.error('Champs manquants:', { date, heure, type, description });
      return res.status(400).json({ error: 'Champs manquants' });
    }
    RendezVous.create({
      date, heure, type, description,
      statut: 'En attente',
      clientId,
      fiduciaireId
    }, (err, result) => {
      if (err) {
        console.error('Erreur SQL lors de l\'insertion du rendez-vous:', err);
        return res.status(500).json({ error: 'Erreur serveur', details: err });
      }
      console.log('Rendez-vous créé avec succès, id:', result.insertId);
      res.json({ success: true, id: result.insertId });
    });
  });
};

exports.getByClient = (req, res) => {
  const clientId = req.user.id;
  RendezVous.getByClient(clientId, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json(rows);
  });
};

exports.delete = (req, res) => {
  const clientId = req.user.id;
  const id = req.params.id;
  RendezVous.delete(id, clientId, (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json({ success: true });
  });
};

exports.getByFiduciaire = (req, res) => {
  const fiduciaireId = req.user.id;
  RendezVous.getByFiduciaire(fiduciaireId, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json(rows);
  });
};

exports.updateStatut = (req, res) => {
  const fiduciaireId = req.user.id;
  const id = req.params.id;
  const { statut } = req.body;
  if (!['confirmé', 'refusé'].includes(statut)) {
    return res.status(400).json({ error: 'Statut invalide' });
  }
  RendezVous.updateStatut(id, fiduciaireId, statut, (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json({ success: true });
  });
}; 