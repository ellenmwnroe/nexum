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
        rg,
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


    // 🕵️ MODO DETETIVE ATIVADO
    console.log("--- DEBUG ANTES DE SALVAR ---");
    console.log("ID do Office que chegou:", office_id);
    console.log("Tamanho do ID:", office_id ? office_id.length : "Indefinido");
    
    const escritórioExiste = await tx.office.findUnique({
      where: { id: office_id }
    });
    console.log("O Prisma achou esse escritório no banco?", escritórioExiste ? "SIM!" : "NÃO ACHEI NADA!");
    console.log("-----------------------------");

  const caseEntity = await tx.case.create({
      data: {
        office: { connect: { id: office_id } },
        user: { connect: { id: user.id } },
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
      user: {
        include: {
          addresses: true 
        }
      },
      triage_responses: true, 
    },
    orderBy: {
      created_at: "desc",
    },
  });

  // Removemos aquele .map() antigo que estava "escondendo" os dados.
  // Agora o React vai receber o objeto completo exatamente como está no banco de dados.
  return casos;
}

// Busca um caso específico pelo ID (Story 1)
async function getCaseById(id) {
  return await prisma.case.findUnique({
    where: { id },
    include: {
      user: {
        include: { addresses: true }
      },
      triage_responses: true,
    },
  });
}

// Atualiza o status ou as notas do caso
async function updateCase(id, data) {
  // Vamos montar os dados dinamicamente, só atualizando o que for enviado
  const dadosParaAtualizar = {};
  if (data.status !== undefined) dadosParaAtualizar.status = data.status;
  if (data.notes !== undefined) dadosParaAtualizar.notes = data.notes;

  return await prisma.case.update({
    where: { id },
    data: dadosParaAtualizar,
  });
}

module.exports = { createCaseFromTriage, getCasesByOffice, getCaseById, updateCase };
