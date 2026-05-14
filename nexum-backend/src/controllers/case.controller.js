const caseService = require("../services/case.service");

async function listCases(req, res) {
  try {
    const officeId = req.query.office_id;
    const status = req.query.status; // 👈 NOVA LINHA: Captura o ?status= da URL
    const cases = await caseService.getCasesByOffice(officeId, status);

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

async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // 1. Validar com os Enums exigidos na Story
    const statusValidos = ['NOVO', 'EM_ANALISE', 'CONTATADO', 'CONTRATADO', 'DESCARTADO'];
    
    if (!statusValidos.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Status inválido. Use um dos status permitidos." 
      });
    }

    // 2. Manda o Service atualizar lá no Prisma
    const casoAtualizado = await caseService.updateCaseStatus(id, status);

    return res.status(200).json({ 
      success: true, 
      message: "Status atualizado com sucesso!", 
      case: casoAtualizado 
    });

  } catch (error) {
    console.error("Erro ao atualizar status do caso:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Erro interno ao atualizar." 
    });
  }
}

module.exports = { 
  listCases, 
  getCaseById, 
  updateCase,
  updateStatus
};
