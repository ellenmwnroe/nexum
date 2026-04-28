const caseService = require("../services/case.service");

async function listCases(req, res) {
  try {
    // extrai o ID do escritório que está a fazer o pedido
    // (pode vir de req.query, req.headers, ou req.user se já tiver token de autenticação (JWT) do advogado logado)
    const officeId = req.query.office_id; 

    // trava de segurança: se não disser qual é o escritório, bloqueia o acesso
    if (!officeId) {
      return res.status(401).json({ error: "Acesso negado. ID do escritório (office_id) não fornecido." });
    }

    // pede ao service APENAS os casos daquele escritório
    const cases = await caseService.getCasesByOffice(officeId);
    
    res.json(cases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { listCases };