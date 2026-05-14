const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Função auxiliar para arrancar acentos, cedilhas e maiúsculas
function normalizeText(text) {
  if (!text) return '';
  return text
    .normalize("NFD") 
    .replace(/[\u0300-\u036f]/g, "") 
    .toLowerCase(); 
}

// O "Cérebro" do Nexum - Versão Múltiplas Classificações
function classifyCase(triageResponses) {
  const dictionary = {};
  triageResponses.forEach(r => { 
    dictionary[r.field_name] = normalizeText(r.value); 
  });

  const labels = []; // Nossa lista vazia que vai acumular os problemas

  // Regra 1: Pejotização
  if (dictionary.carteira_assinada?.includes('nao') && dictionary.subordinacao?.includes('sim')) {
    labels.push('PEJOTIZACAO');
  }

  // Regra 2: Assédio
  if (
    dictionary.condicoes_trabalho?.includes('assedio') || 
    dictionary.condicoes_trabalho?.includes('humilha') ||
    dictionary.condicoes_trabalho?.includes('ofen') || 
    dictionary.condicoes_trabalho?.includes('xing') 
  ) {
    labels.push('ASSÉDIO');
  }

  // Regra 3: Horas Extras
  if (dictionary.horas_extras?.includes('sim')) {
    labels.push('HORAS_EXTRAS');
  }

  // Regra 4: Verbas Rescisórias / Demissão
  if (dictionary.situacao?.includes('demiti') || dictionary.situacao?.includes('rescisao')) {
    labels.push('RESCISAO');
  }

  // Regra 5: FGTS
  if (dictionary.fgts_rescisao?.includes('nao') || dictionary.fgts_rescisao?.includes('atrasad')) {
    labels.push('FGTS');
  }

  // Regra 6: Verbas Pendentes
  if (dictionary.verbas_pendentes?.includes('sim')) {
    labels.push('VERBAS_PENDENTES');
  }

  // Se passou por tudo e a lista continuou vazia, cai no geral
  if (labels.length === 0) {
    labels.push('GERAL_TRABALHISTA');
  }

  // Transforma o array ['PEJOTIZACAO', 'ASSÉDIO'] em uma única string: "PEJOTIZACAO, ASSÉDIO"
  return labels.join(', '); 
}

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

  // 1. Transforma o objeto { chave: valor } no array [{ field_name, value }] que o Prisma exige
  const respostasFormatadas = Object.entries(respostasDinamicas).map(([chave, valor]) => ({
    field_name: chave,
    value: valor
  }));

  // 2. Agora sim você passa esse array formatado para a inteligência classificar
  const tipoDoCaso = classifyCase(respostasFormatadas);

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
        case_type: tipoDoCaso,
        triage_responses: {
          create: respostasFormatadas 
        }
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

async function getCasesByOffice(officeId, status) {
  // Montamos os filtros de forma dinâmica: 
  // Se vier o officeId, ele entra. Se vier o status, ele entra também!
  const filtros = {
    ...(officeId && { office_id: officeId }),
    ...(status && { status: status })
  };

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

// Atualiza apenas o status do caso
async function updateCaseStatus(id, status) {
  // Lembre-se de usar a mesma instância do prisma que já está declarada no topo do seu arquivo
  return await prisma.case.update({
    where: { id: id },
    data: { status: status },
  });
}

// Adicione ela no exports no final do arquivo:
module.exports = {
  createCaseFromTriage, // a que você já tinha
  updateCaseStatus      // a nossa nova
};

module.exports = { classifyCase, createCaseFromTriage, getCasesByOffice, getCaseById, updateCase, updateCaseStatus };
