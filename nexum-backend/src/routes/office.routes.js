const express = require('express');
const router = express.Router();
const officeController = require('../controllers/office.controller');
const { ensureAuthenticated } = require('../middlewares/auth.middleware');

router.get('/me', ensureAuthenticated, officeController.getOffice);
router.patch('/me', ensureAuthenticated, officeController.updateOffice);

module.exports = router;