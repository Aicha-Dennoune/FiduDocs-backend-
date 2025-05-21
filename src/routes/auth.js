// routes/auth.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authController = require('../controllers/authController');
const jwt = require('jsonwebtoken');

router.post('/login', (req, res) => {
  console.log('Route /login appelée');
  const { email, password } = req.body;
  console.log('Tentative de connexion avec:', { email, password });

  const sql = 'SELECT * FROM Utilisateur WHERE Email = ? AND MotDePasse = ?';
  const query = db.format(sql, [email, password]);
  console.log('Requête SQL:', query);
  db.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error('Erreur lors de la requête :', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    console.log('Résultats de la requête:', results);

    if (results.length > 0) {
      const utilisateur = results[0];
      // Générer le token JWT avec le rôle inclus
      const token = jwt.sign(
        { id: utilisateur.Id, role: utilisateur.Role }, // payload avec le rôle
        'votre_secret_jwt',     // même clé que dans le middleware
        { expiresIn: '7d' }
      );
      res.json({
        message: 'Connexion réussie',
        utilisateur: {
          id: utilisateur.Id,
          nom: utilisateur.Nom,
          prenom: utilisateur.Prenom,
          email: utilisateur.Email,
          role: utilisateur.Role
        },
        token // <-- renvoyer le token au frontend
      });
    } else {
      res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
  });
});

// Route pour l'inscription des clients
router.post('/inscription-client', authController.inscriptionClient);

module.exports = router;
