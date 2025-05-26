const Document = require('../models/Document');
const RendezVous = require('../models/RendezVous');

// GET /api/statistiques/documents/:userId
exports.getDocumentsStats = (req, res) => {
  const userId = req.params.userId;
  const userType = (req.user.role || '').toLowerCase(); // 'client' ou 'fiduciaire'
  Document.countDocuments(userId, userType, (err, stats) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur' });
    res.json({
      postes: stats.postes || 0,
      recus: stats.recus || 0
    });
  });
};

// GET /api/statistiques/rendezvous/:userId
exports.getRendezVousStats = (req, res) => {
  const userId = req.params.userId;
  const userType = (req.user.role || '').toLowerCase();
  console.log('userType:', userType, 'userId:', userId);
  const callback = (err, rdvs) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur' });
    console.log('rdvs:', rdvs);
    const result = rdvs.map(r => ({
      date: r.Date ? r.Date.toISOString().split('T')[0] : '',
      statut: r.Statut ? r.Statut.toLowerCase() : ''
    }));
    res.json(result);
  };
  if (userType === 'client') {
    RendezVous.getByClient(userId, (err, rows) => callback(err, rows || []));
  } else {
    RendezVous.getByFiduciaire(userId, (err, rows) => callback(err, rows || []));
  }
}; 