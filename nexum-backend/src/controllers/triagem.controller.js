const caseService = require("../services/case.service");

async function handleTriagem(req, res) {
  try {
    // todo o objeto JSON enviado pelo frontend do React
    const payloadTriagem = req.body;
    
    // passamos para o arquivo de serviço processar e salvar no banco
    const casoSalvo = await caseService.createCaseFromTriage(payloadTriagem);

    // retorna a resposta de sucesso com o ID do caso recém-criado
    res.status(201).json({
      success: true,
      message: "Triagem cadastrada com sucesso!",
      case_id: casoSalvo.id
    });
  } catch (err) {
    console.error("Erro no Controller de Triagem:", err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { handleTriagem };