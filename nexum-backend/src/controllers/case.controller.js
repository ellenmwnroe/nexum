const caseService = require("../services/case.service");

async function listCases(req, res) {
  try {
    const officeId = req.query.office_id;
    const cases = await caseService.getCasesByOffice(officeId);

    return res.status(200).json({
      success: true,
      data: cases,
    });
  } catch (err) {
    console.error("Erro no Controller de Cases:", err);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao listar casos.",
    });
  }
}

module.exports = { listCases };
