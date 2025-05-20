const db = require('../config/db');

exports.getMe = (req, res) => {
  console.log('getMe appelé avec req.user:', req.user);
  
  if (!req.user || !req.user.id) {
    console.error('ID utilisateur manquant dans req.user:', req.user);
    return res.status(400).json({ message: 'ID utilisateur manquant' });
  }

  const userId = req.user.id;
  console.log('ID utilisateur extrait:', userId);

  // Vérifier si la connexion à la base de données est active
  if (!db) {
    console.error('Connexion à la base de données non initialisée');
    return res.status(500).json({ message: 'Erreur de connexion à la base de données' });
  }

  // Requête SQL modifiée pour correspondre à la structure réelle de la table
  const sql = `
    SELECT u.Id, u.Nom, u.Prenom, u.Email, u.Tele, u.Role, u.PhotoProfil, f.AdresseSiege as Adresse
    FROM Utilisateur u
    LEFT JOIN Fiduciaire f ON u.Id = f.Id
    WHERE u.Id = ?
  `;
  console.log('Requête SQL:', sql, [userId]);
  
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Erreur détaillée lors de la requête SQL:', {
        message: err.message,
        code: err.code,
        sqlMessage: err.sqlMessage,
        sqlState: err.sqlState
      });
      return res.status(500).json({ 
        message: 'Erreur serveur',
        details: err.message
      });
    }

    if (!results.length) {
      console.log('Aucun utilisateur trouvé avec l\'ID:', userId);
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const user = results[0];
    console.log('Données utilisateur trouvées:', user);

    const response = {
      id: user.Id,
      nom: user.Nom,
      prenom: user.Prenom,
      email: user.Email,
      tele: user.Tele,
      role: user.Role,
      image: user.PhotoProfil || '', // Utilisation de PhotoProfil au lieu de Image
      adresse: user.Adresse || user.adresse || user.AdresseSiege || user.adresseSiege || ''
    };
    console.log('Réponse envoyée:', response);
    res.json(response);
  });
};

exports.updateMe = (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(400).json({ message: 'ID utilisateur manquant' });
  }
  const userId = req.user.id;
  const { nom, prenom, email, tele, adresse } = req.body;

  // Mettre à jour la table Utilisateur
  const sqlUser = 'UPDATE Utilisateur SET Nom = ?, Prenom = ?, Email = ?, Tele = ? WHERE Id = ?';
  db.query(sqlUser, [nom, prenom, email, tele, userId], (err) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur', details: err.message });
    }
    // Vérifier si l'utilisateur est un fiduciaire
    const sqlRole = 'SELECT Role FROM Utilisateur WHERE Id = ?';
    db.query(sqlRole, [userId], (err, results) => {
      if (err || !results.length) {
        return res.status(500).json({ message: 'Erreur lors de la vérification du rôle', details: err?.message });
      }
      if (results[0].Role === 'Fiduciaire') {
        // Mettre à jour l'adresse dans la table Fiduciaire
        const sqlFidu = 'UPDATE Fiduciaire SET AdresseSiege = ? WHERE Id = ?';
        db.query(sqlFidu, [adresse, userId], (err) => {
          if (err) {
            return res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'adresse', details: err.message });
          }
          // Retourner le profil à jour
          exports.getMe(req, res);
        });
      } else {
        // Retourner le profil à jour
        exports.getMe(req, res);
      }
    });
  });
}; 