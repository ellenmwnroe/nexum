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

async function getCaseById(req, res) {
  try {
    // Pega o ID da URL e manda pro Service trabalhar
    const caso = await caseService.getCaseById(req.params.id);
    if (!caso) {
      return res.status(404).json({ error: "Caso não encontrado" });
    }
    res.json(caso); // Devolve pro Front-end
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar o caso" });
  }
}

async function updateCase(req, res) {
  try {
    const atualizado = await caseService.updateCase(req.params.id, req.body);
    res.json(atualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar o caso" });
  }
}

module.exports = { 
  listCases, 
  getCaseById, 
  updateCase 
};
