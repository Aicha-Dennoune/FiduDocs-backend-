const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Routes protégées
router.get('/me', auth.verifyToken, userController.getMe);
router.put('/me', auth.verifyToken, userController.updateMe);
router.put('/email', auth.verifyToken, userController.changeEmail);
router.put('/password', auth.verifyToken, userController.changePassword);
router.post('/deactivate', auth.verifyToken, userController.deactivateAccount);

module.exports = router; 