const caseService = require("../services/case.service");

function validarPayloadTriagem(payload = {}) {
  const camposObrigatorios = ["nome", "cpf", "empresa", "funcao", "office_id"];
  const faltantes = camposObrigatorios.filter((campo) => !payload[campo]);

  if (faltantes.length > 0) {
    return `Campos obrigatórios ausentes: ${faltantes.join(", ")}`;
  }

  return null;
}

async function handleTriagem(req, res) {
  try {
    const payloadTriagem = req.body;
    const erroValidacao = validarPayloadTriagem(payloadTriagem);

    if (erroValidacao) {
      return res.status(400).json({
        success: false,
        message: erroValidacao,
      });
    }

    const casoSalvo = await caseService.createCaseFromTriage(payloadTriagem);

    return res.status(201).json({
      success: true,
      message: "Triagem cadastrada com sucesso!",
      case_id: casoSalvo.id,
    });
  } catch (err) {
    console.error("Erro no Controller de Triagem:", err);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao salvar triagem.",
    });
  }
}

module.exports = { handleTriagem };
