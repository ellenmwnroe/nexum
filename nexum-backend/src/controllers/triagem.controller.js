const Case = require("../models/case.model");
const caseService = require("../services/case.service");

async function handleTriagem(req, res) {
  try {
    const caseData = new Case(req.body);

    const saved = await caseService.createCase(caseData);

    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { handleTriagem };
