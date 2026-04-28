const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function createCaseFromTriage(dadosTriagem) {
  const {
    nome,
    cpf,
    rg,
    telefone,
    email,
    cep,
    endereco_compl,
    empresa,
    funcao,
    data_admissao,
    data_demissao,
    salario,
    office_id,
    lgpd,
    ...respostasDinamicas
  } = dadosTriagem;

  if (!cpf || !nome || !office_id || !empresa || !funcao) {
    throw new Error("Campos obrigatórios da triagem estão ausentes.");
  }

  let salarioNumerico = null;
  if (salario) {
    salarioNumerico = parseFloat(String(salario).replace(/[^\d,]/g, "").replace(",", "."));
  }

  const novoCaso = await prisma.$transaction(async (tx) => {
    const user = await tx.user.upsert({
      where: { cpf },
      update: {
        phone: telefone,
        email,
      },
      create: {
        name: nome,
        cpf,
        rg,
        phone: telefone,
        email,
        addresses: cep || endereco_compl
          ? {
              create: {
                cep: cep || "00000-000",
                full_address: endereco_compl || "Não informado",
              },
            }
          : undefined,
      },
    });

    const caseEntity = await tx.case.create({
      data: {
        user_id: user.id,
        office_id,
        company: empresa,
        role: funcao,
        admission_date: data_admissao ? new Date(data_admissao) : null,
        resignation_date: data_demissao ? new Date(data_demissao) : null,
        salary: salarioNumerico,
        status: "NOVO",
      },
    });

    const arrayDeRespostas = Object.entries(respostasDinamicas).map(([campo, valor]) => ({
      case_id: caseEntity.id,
      field_name: campo,
      value: String(valor),
    }));

    if (arrayDeRespostas.length > 0) {
      await tx.triageResponse.createMany({ data: arrayDeRespostas });
    }

    return caseEntity;
  });

  return novoCaso;
}

async function getCasesByOffice(officeId) {
  const filtros = officeId ? { office_id: officeId } : {};

  const casos = await prisma.case.findMany({
    where: filtros,
    include: {
      user: true, // Agora traz o nome, CPF, etc.
      triage_responses: true, // Traz todas as respostas do bot!
    },
    orderBy: {
      created_at: "desc",
    },
  });

  // Removemos aquele .map() antigo que estava "escondendo" os dados.
  // Agora o React vai receber o objeto completo exatamente como está no banco de dados.
  return casos;
}

module.exports = { createCaseFromTriage, getCasesByOffice };
