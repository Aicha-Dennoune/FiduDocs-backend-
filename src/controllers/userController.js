const db = require('../config/db');
const bcrypt = require('bcryptjs');

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

// Changer l'email
exports.changeEmail = (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(400).json({ message: 'ID utilisateur manquant' });
  }

  const userId = req.user.id;
  const { email, oldPassword } = req.body;

  console.log('Tentative de changement d\'email pour l\'utilisateur:', userId);
  console.log('Nouvel email:', email);

  // Vérifier d'abord le mot de passe
  const checkPasswordSql = 'SELECT MotDePasse FROM Utilisateur WHERE Id = ?';
  db.query(checkPasswordSql, [userId], (err, results) => {
    if (err) {
      console.error('Erreur SQL:', err);
      return res.status(500).json({ message: 'Erreur lors de la vérification du mot de passe', details: err.message });
    }

    if (!results.length) {
      console.log('Aucun utilisateur trouvé avec l\'ID:', userId);
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    console.log('Mot de passe en base:', results[0].MotDePasse);
    console.log('Mot de passe fourni:', oldPassword);

    // Vérifier si le mot de passe correspond directement
    if (oldPassword !== results[0].MotDePasse) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    // Mettre à jour l'email
    const updateEmailSql = 'UPDATE Utilisateur SET Email = ? WHERE Id = ?';
    db.query(updateEmailSql, [email, userId], (err) => {
      if (err) {
        console.error('Erreur lors de la mise à jour de l\'email:', err);
        // Vérifier si l'erreur est due à un email en double
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }
        return res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'email', details: err.message });
      }
      console.log('Email mis à jour avec succès pour l\'utilisateur:', userId);
      res.json({ message: 'Email mis à jour avec succès' });
    });
  });
};

// Changer le mot de passe
exports.changePassword = (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(400).json({ message: 'ID utilisateur manquant' });
  }

  const userId = req.user.id;
  const { oldPassword, newPassword } = req.body;

  console.log('Tentative de changement de mot de passe pour l\'utilisateur:', userId);

  // Vérifier d'abord l'ancien mot de passe
  const checkPasswordSql = 'SELECT MotDePasse FROM Utilisateur WHERE Id = ?';
  db.query(checkPasswordSql, [userId], (err, results) => {
    if (err) {
      console.error('Erreur SQL:', err);
      return res.status(500).json({ message: 'Erreur lors de la vérification du mot de passe', details: err.message });
    }

    if (!results.length) {
      console.log('Aucun utilisateur trouvé avec l\'ID:', userId);
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    console.log('Mot de passe en base:', results[0].MotDePasse);
    console.log('Ancien mot de passe fourni:', oldPassword);

    // Vérifier si l'ancien mot de passe correspond directement
    if (oldPassword !== results[0].MotDePasse) {
      return res.status(401).json({ message: 'Ancien mot de passe incorrect' });
    }

    // Mettre à jour le mot de passe
    const updatePasswordSql = 'UPDATE Utilisateur SET MotDePasse = ? WHERE Id = ?';
    db.query(updatePasswordSql, [newPassword, userId], (err) => {
      if (err) {
        console.error('Erreur lors de la mise à jour du mot de passe:', err);
        return res.status(500).json({ message: 'Erreur lors de la mise à jour du mot de passe', details: err.message });
      }
      console.log('Mot de passe mis à jour avec succès pour l\'utilisateur:', userId);
      res.json({ message: 'Mot de passe mis à jour avec succès' });
    });
  });
};

// Désactiver le compte client
exports.deactivateAccount = (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(400).json({ message: 'ID utilisateur manquant' });
  }

  const userId = req.user.id;
  const { password } = req.body;

  console.log('Tentative de désactivation du compte pour l\'utilisateur:', userId);

  // Vérifier d'abord le mot de passe
  const checkPasswordSql = 'SELECT MotDePasse, Role FROM Utilisateur WHERE Id = ?';
  db.query(checkPasswordSql, [userId], (err, results) => {
    if (err) {
      console.error('Erreur SQL:', err);
      return res.status(500).json({ message: 'Erreur lors de la vérification du mot de passe', details: err.message });
    }

    if (!results.length) {
      console.log('Aucun utilisateur trouvé avec l\'ID:', userId);
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier si c'est un client
    if (results[0].Role !== 'Client') {
      return res.status(403).json({ message: 'Seuls les clients peuvent désactiver leur compte' });
    }

    // Vérifier le mot de passe
    if (password !== results[0].MotDePasse) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    // Supprimer le compte client
    const deleteClientSql = 'DELETE FROM Client WHERE Id = ?';
    db.query(deleteClientSql, [userId], (err) => {
      if (err) {
        console.error('Erreur lors de la suppression du client:', err);
        return res.status(500).json({ message: 'Erreur lors de la désactivation du compte', details: err.message });
      }

      // Supprimer l'utilisateur (cela supprimera aussi automatiquement les enregistrements dans ClientParticulier ou ClientEntreprise grâce à ON DELETE CASCADE)
      const deleteUserSql = 'DELETE FROM Utilisateur WHERE Id = ?';
      db.query(deleteUserSql, [userId], (err) => {
        if (err) {
          console.error('Erreur lors de la suppression de l\'utilisateur:', err);
          return res.status(500).json({ message: 'Erreur lors de la désactivation du compte', details: err.message });
        }

        console.log('Compte désactivé avec succès pour l\'utilisateur:', userId);
        res.json({ message: 'Compte désactivé avec succès' });
      });
    });
  });
}; 