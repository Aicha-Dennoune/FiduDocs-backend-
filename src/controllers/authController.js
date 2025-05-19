const db = require('../config/db');

// Inscription d'un client (Entreprise ou Particulier)
exports.inscriptionClient = (req, res) => {
  console.log('Données reçues:', req.body);
  const { nom, prenom, email, motDePasse, tele, typeClient, adresse, nomEntreprise, adresseEntreprise } = req.body;

  // 1. Insérer dans la table Utilisateur
  const sqlUtilisateur = 'INSERT INTO Utilisateur (Nom, Prenom, Email, MotDePasse, Tele, Role) VALUES (?, ?, ?, ?, ?, ?)';
  console.log('Requête Utilisateur:', sqlUtilisateur, [nom, prenom, email, motDePasse, tele, 'Client']);
  
  db.query(sqlUtilisateur, [nom, prenom, email, motDePasse, tele, 'Client'], (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'insertion dans Utilisateur:', err);
      return res.status(500).json({ message: 'Erreur serveur lors de l\'insertion dans Utilisateur' });
    }

    const utilisateurId = result.insertId;
    console.log('Utilisateur créé avec l\'ID:', utilisateurId);

    // 2. Insérer dans la table Client
    const sqlClient = 'INSERT INTO Client (Id, TypeClient) VALUES (?, ?)';
    console.log('Requête Client:', sqlClient, [utilisateurId, typeClient]);
    
    db.query(sqlClient, [utilisateurId, typeClient], (err, result) => {
      if (err) {
        console.error('Erreur lors de l\'insertion dans Client:', err);
        return res.status(500).json({ message: 'Erreur serveur lors de l\'insertion dans Client' });
      }

      console.log('Client créé avec succès');

      // 3. Insérer dans la table correspondante (ClientEntreprise ou ClientParticulier)
      if (typeClient === 'Entreprise') {
        const sqlClientEntreprise = 'INSERT INTO ClientEntreprise (Id, NomEntreprise, AdresseEntreprise) VALUES (?, ?, ?)';
        console.log('Requête ClientEntreprise:', sqlClientEntreprise, [utilisateurId, nomEntreprise, adresseEntreprise]);
        
        db.query(sqlClientEntreprise, [utilisateurId, nomEntreprise, adresseEntreprise], (err, result) => {
          if (err) {
            console.error('Erreur lors de l\'insertion dans ClientEntreprise:', err);
            return res.status(500).json({ message: 'Erreur serveur lors de l\'insertion dans ClientEntreprise' });
          }
          console.log('ClientEntreprise créé avec succès');
          res.status(201).json({ message: 'Inscription réussie (Entreprise)' });
        });
      } else if (typeClient === 'Particulier') {
        const sqlClientParticulier = 'INSERT INTO ClientParticulier (Id, Adresse) VALUES (?, ?)';
        console.log('Requête ClientParticulier:', sqlClientParticulier, [utilisateurId, adresse]);
        
        db.query(sqlClientParticulier, [utilisateurId, adresse], (err, result) => {
          if (err) {
            console.error('Erreur lors de l\'insertion dans ClientParticulier:', err);
            return res.status(500).json({ message: 'Erreur serveur lors de l\'insertion dans ClientParticulier' });
          }
          console.log('ClientParticulier créé avec succès');
          res.status(201).json({ message: 'Inscription réussie (Particulier)' });
        });
      } else {
        console.error('Type de client non reconnu:', typeClient);
        res.status(400).json({ message: 'Type de client non reconnu' });
      }
    });
  });
}; 