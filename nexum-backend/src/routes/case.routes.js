const express = require('express');
const router = express.Router();
const caseController = require('../controllers/case.controller');

router.get("/", caseController.listCases); 
router.get('/:id', caseController.getCaseById);
router.patch('/:id', caseController.updateCase);

module.exports = router;