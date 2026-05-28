const express = require('express');
const router = express.Router();
const lawyerController = require('../controllers/lawyer.controller');
const { ensureAuthenticated } = require('../middlewares/auth.middleware'); // Seu middleware de conferir o Token de login
const upload = require('../middlewares/upload.middleware');

router.get('/me', ensureAuthenticated, lawyerController.getProfile);
router.patch('/me', ensureAuthenticated, upload.single('avatar'), lawyerController.updateProfile);

module.exports = router;