const express = require("express");
const router = express.Router();

const { listCases } = require("../controllers/case.controller");

router.get("/", listCases);

module.exports = router;
