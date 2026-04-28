const express = require("express");
const router = express.Router();

const { handleTriagem } = require("../controllers/triagem.controller");

router.post("/", handleTriagem);

module.exports = router;