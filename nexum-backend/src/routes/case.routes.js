const express = require('express');
const router = express.Router();
const caseController = require('../controllers/case.controller');
const { ensureAuthenticated } = require('../middlewares/auth.middleware');

router.get("/", ensureAuthenticated, caseController.listCases); 
router.get('/:id', ensureAuthenticated, caseController.getCaseById);
router.patch('/:id', ensureAuthenticated, caseController.updateCase);

module.exports = router;