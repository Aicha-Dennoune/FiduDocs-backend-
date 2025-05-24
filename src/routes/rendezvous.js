const express = require('express');
const router = express.Router();
const controller = require('../controllers/rendezVousController');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, controller.create);
router.get('/', verifyToken, controller.getByClient);
router.delete('/:id', verifyToken, controller.delete);
router.get('/fiduciaire', verifyToken, controller.getByFiduciaire);
router.patch('/:id/statut', verifyToken, controller.updateStatut);

module.exports = router; 