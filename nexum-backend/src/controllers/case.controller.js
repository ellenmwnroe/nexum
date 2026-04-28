const caseService = require("../services/case.service");

async function listCases(req, res) {
  try {
    const cases = await caseService.getCases();
    res.json(cases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { listCases };
