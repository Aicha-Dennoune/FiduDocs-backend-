const db = require('../config/db');
const Client = require('../models/Client');

exports.getAllClients = (req, res) => {
  // Requête pour récupérer tous les clients avec leurs infos spécifiques
  const sql = `
    SELECT u.Id, u.Nom, u.Prenom, u.Email, u.Tele, c.TypeClient,
      cp.Adresse AS AdresseParticulier,
      ce.NomEntreprise, ce.AdresseEntreprise
    FROM Utilisateur u
    INNER JOIN Client c ON u.Id = c.Id
    LEFT JOIN ClientParticulier cp ON c.Id = cp.Id
    LEFT JOIN ClientEntreprise ce ON c.Id = ce.Id
    ORDER BY u.Nom, u.Prenom
  `;
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la récupération des clients', details: err.message });
    }
    res.json(results);
  });
};

// Récupérer les informations d'un client
exports.getClient = (req, res) => {
  const clientId = req.params.id;

  // Requête avec jointures pour récupérer toutes les informations du client
  const sql = `
    SELECT 
      u.*,
      c.TypeClient,
      COALESCE(cp.Adresse, ce.AdresseEntreprise) as Adresse,
      ce.NomEntreprise
    FROM Utilisateur u
    INNER JOIN Client c ON u.Id = c.Id
    LEFT JOIN ClientParticulier cp ON c.Id = cp.Id
    LEFT JOIN ClientEntreprise ce ON c.Id = ce.Id
    WHERE u.Id = ?
  `;

  db.query(sql, [clientId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération du client:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }

    res.json(results[0]);
  });
};

// Mettre à jour les informations d'un client
exports.updateClient = (req, res) => {
  const clientId = req.params.id;
  const { Nom, Prenom, Email, Tele, TypeClient, NomEntreprise, AdresseEntreprise, Adresse } = req.body;

  // Démarrer une transaction
  db.beginTransaction(err => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors du début de la transaction' });
    }

    // 1. Mettre à jour la table Utilisateur
    const updateUserSql = `
      UPDATE Utilisateur 
      SET Nom = ?, Prenom = ?, Email = ?, Tele = ?
      WHERE Id = ?
    `;

    db.query(updateUserSql, [Nom, Prenom, Email, Tele, clientId], (err) => {
      if (err) {
        return db.rollback(() => {
          res.status(500).json({ message: 'Erreur lors de la mise à jour des informations utilisateur' });
        });
      }

      // 2. Mettre à jour la table Client
      const updateClientSql = `
        UPDATE Client 
        SET TypeClient = ?
        WHERE Id = ?
      `;

      db.query(updateClientSql, [TypeClient, clientId], (err) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).json({ message: 'Erreur lors de la mise à jour des informations client' });
          });
        }

        // 3. Mettre à jour les informations spécifiques selon le type de client
        if (TypeClient === 'Entreprise') {
          const updateEntrepriseSql = `
            UPDATE ClientEntreprise 
            SET NomEntreprise = ?, AdresseEntreprise = ?
            WHERE Id = ?
          `;

          db.query(updateEntrepriseSql, [NomEntreprise, AdresseEntreprise, clientId], (err) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({ message: 'Erreur lors de la mise à jour des informations entreprise' });
              });
            }

            // Valider la transaction
            db.commit(err => {
              if (err) {
                return db.rollback(() => {
                  res.status(500).json({ message: 'Erreur lors de la validation des modifications' });
                });
              }

              // Récupérer les données mises à jour
              exports.getClient(req, res);
            });
          });
        } else {
          const updateParticulierSql = `
            UPDATE ClientParticulier 
            SET Adresse = ?
            WHERE Id = ?
          `;

          db.query(updateParticulierSql, [Adresse, clientId], (err) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({ message: 'Erreur lors de la mise à jour des informations particulier' });
              });
            }

            // Valider la transaction
            db.commit(err => {
              if (err) {
                return db.rollback(() => {
                  res.status(500).json({ message: 'Erreur lors de la validation des modifications' });
                });
              }

              // Récupérer les données mises à jour
              exports.getClient(req, res);
            });
          });
        }
      });
    });
  });
};

// Récupérer les informations du client connecté
exports.getMe = (req, res) => {
  const userId = req.user.id;

  // Requête avec jointures pour récupérer toutes les informations du client
  const sql = `
    SELECT 
      u.Id,
      u.Nom,
      u.Prenom,
      u.Email,
      u.Tele,
      u.PhotoProfil,
      u.Role,
      c.TypeClient,
      cp.Adresse,
      ce.NomEntreprise,
      ce.AdresseEntreprise
    FROM Utilisateur u
    INNER JOIN Client c ON u.Id = c.Id
    LEFT JOIN ClientParticulier cp ON c.Id = cp.Id
    LEFT JOIN ClientEntreprise ce ON c.Id = ce.Id
    WHERE u.Id = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération du client:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }

    res.json(results[0]);
  });
};

// Mettre à jour les informations du client connecté
exports.updateMe = (req, res) => {
  const userId = req.user.id;
  const { Nom, Prenom, Email, Tele, TypeClient, NomEntreprise, AdresseEntreprise, Adresse } = req.body;

  // Démarrer une transaction
  db.beginTransaction(err => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors du début de la transaction' });
    }

    // 1. Mettre à jour la table Utilisateur
    const updateUserSql = `
      UPDATE Utilisateur 
      SET Nom = ?, Prenom = ?, Email = ?, Tele = ?
      WHERE Id = ?
    `;

    db.query(updateUserSql, [Nom, Prenom, Email, Tele, userId], (err) => {
      if (err) {
        return db.rollback(() => {
          res.status(500).json({ message: 'Erreur lors de la mise à jour des informations utilisateur' });
        });
      }

      // 2. Mettre à jour la table Client
      const updateClientSql = `
        UPDATE Client 
        SET TypeClient = ?
        WHERE Id = ?
      `;

      db.query(updateClientSql, [TypeClient, userId], (err) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).json({ message: 'Erreur lors de la mise à jour des informations client' });
          });
        }

        // 3. Mettre à jour les informations spécifiques selon le type de client
        if (TypeClient === 'Entreprise') {
          const updateEntrepriseSql = `
            UPDATE ClientEntreprise 
            SET NomEntreprise = ?, AdresseEntreprise = ?
            WHERE Id = ?
          `;

          db.query(updateEntrepriseSql, [NomEntreprise, AdresseEntreprise, userId], (err) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({ message: 'Erreur lors de la mise à jour des informations entreprise' });
              });
            }

            // Valider la transaction
            db.commit(err => {
              if (err) {
                return db.rollback(() => {
                  res.status(500).json({ message: 'Erreur lors de la validation des modifications' });
                });
              }

              // Récupérer les données mises à jour
              exports.getMe(req, res);
            });
          });
        } else {
          const updateParticulierSql = `
            UPDATE ClientParticulier 
            SET Adresse = ?
            WHERE Id = ?
          `;

          db.query(updateParticulierSql, [Adresse, userId], (err) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({ message: 'Erreur lors de la mise à jour des informations particulier' });
              });
            }

            // Valider la transaction
            db.commit(err => {
              if (err) {
                return db.rollback(() => {
                  res.status(500).json({ message: 'Erreur lors de la validation des modifications' });
                });
              }

              // Récupérer les données mises à jour
              exports.getMe(req, res);
            });
          });
        }
      });
    });
  });
};

exports.deleteClient = (req, res) => {
  const clientId = req.params.id;
  const sql = 'DELETE FROM Utilisateur WHERE Id = ?';
  db.query(sql, [clientId], (err, result) => {
    if (err) {
      console.error('Erreur lors de la suppression du client:', err);
      return res.status(500).json({ message: 'Erreur lors de la suppression du client' });
    }
    res.json({ success: true });
  });
}; 