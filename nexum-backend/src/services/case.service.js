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

function classifyCase(triageResponses) {
  const dictionary = {};
  triageResponses.forEach(r => { dictionary[r.field_name] = normalizeText(r.value); });

  const labels = [];
  if (dictionary.carteira_assinada?.includes('nao') && dictionary.subordinacao?.includes('sim')) labels.push('PEJOTIZACAO');
  if (dictionary.condicoes_trabalho?.includes('assedio') || dictionary.condicoes_trabalho?.includes('humilha') || dictionary.condicoes_trabalho?.includes('ofens') || dictionary.condicoes_trabalho?.includes('xing')) labels.push('ASSÉDIO');
  if (dictionary.horas_extras?.includes('sim')) labels.push('HORAS_EXTRAS');
  if (dictionary.situacao?.includes('demiti') || dictionary.situacao?.includes('rescisao')) labels.push('RESCISAO');
  if (dictionary.fgts_rescisao?.includes('nao') || dictionary.fgts_rescisao?.includes('atrasad')) labels.push('FGTS');
  if (dictionary.verbas_pendentes?.includes('sim')) labels.push('VERBAS_PENDENTES');
  
  if (labels.length === 0) labels.push('GERAL_TRABALHISTA');
  return labels.join(', '); 
}

function calculatePriority(triageResponses) {
  const dictionary = {};
  triageResponses.forEach(r => { 
    dictionary[r.field_name] = normalizeText(r.value); // Usa a mesma função de limpar texto
  });

  let score = 0;

  // 1. Assédio é gravíssimo, já joga a prioridade lá pra cima (+3 pontos)
  if (
    dictionary.condicoes_trabalho?.includes('assedio') || 
    dictionary.condicoes_trabalho?.includes('humilha') ||
    dictionary.condicoes_trabalho?.includes('ofen') || 
    dictionary.condicoes_trabalho?.includes('xing') 
  ) {
    score += 3;
  }

  // 2. Pejotização é grave (+2 pontos)
  if (dictionary.carteira_assinada?.includes('nao') && dictionary.subordinacao?.includes('sim')) {
    score += 2;
  }

  // 3. Verbas, FGTS e Horas Extras são problemas comuns, acumulam (+1 ponto cada)
  if (dictionary.situacao?.includes('demiti') || dictionary.situacao?.includes('rescisao')) score += 1;
  if (dictionary.fgts_rescisao?.includes('nao') || dictionary.fgts_rescisao?.includes('atrasad')) score += 1;
  if (dictionary.horas_extras?.includes('sim')) score += 1;
  if (dictionary.verbas_pendentes?.includes('sim')) score += 1;

  // Classificação final baseada no total de pontos
  if (score >= 3) return 'ALTA';
  if (score === 2) return 'MEDIA';
  return 'BAIXA';
}

// Função para gerar o resumo estruturado 
function generateCaseSummary(caseData) {
  // Extraindo os dados básicos com proteção (fallback)
  const userName = caseData.user?.name || "Cliente não identificado";
  const company = caseData.company || "empresa não informada";
  const role = caseData.role || "função não informada";

  // Transforma as respostas num dicionário para facilitar a leitura
  const dic = {};
  if (caseData.triage_responses) {
    caseData.triage_responses.forEach(r => {
      dic[r.field_name] = r.value; // Aqui pegamos o texto original para ficar legível
    });
  }

  // Pegando e formatando as situações
  const carteira = dic.carteira_assinada?.toLowerCase() === 'sim' ? 'com carteira assinada' : 'sem carteira assinada';
  const situacao = dic.situacao ? dic.situacao.toLowerCase() : 'desligamento';

  // 1. Início do texto
  let summary = `O cliente ${userName} trabalhou na empresa ${company} atuando como ${role}, ${carteira}. `;
  summary += `Informou que o fim do vínculo se deu por ${situacao}. `;

  // 2. Coletando os agravantes
  const agravantes = [];
  if (dic.horas_extras?.toLowerCase() === 'sim') agravantes.push('horas extras não pagas');
  if (dic.verbas_pendentes?.toLowerCase() === 'sim') agravantes.push('verbas pendentes');
  if (dic.fgts_rescisao?.toLowerCase().includes('nao') || dic.fgts_rescisao?.toLowerCase().includes('atrasad')) agravantes.push('problemas com FGTS/Rescisão');
  
  // Condições de trabalho (se o texto for longo e diferente de "não")
  if (dic.condicoes_trabalho && dic.condicoes_trabalho.length > 4 && !dic.condicoes_trabalho.toLowerCase().includes('nao')) {
    agravantes.push('relatos de más condições de trabalho ou assédio');
  }

  // 3. Fechamento do texto
  if (agravantes.length > 0) {
    summary += `O caso apresenta possíveis irregularidades relacionadas a: ${agravantes.join(', ')}.`;
  } else {
    summary += `Não foram relatados agravantes específicos na triagem inicial.`;
  }

  return summary;
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

  const tipoDoCaso = classifyCase(respostasFormatadas);
  const prioridadeDoCaso = calculatePriority(respostasFormatadas);

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
        priority: prioridadeDoCaso,
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
  const caso = await prisma.case.findUnique({
    where: { id },
    include: { 
      user: true, 
      triage_responses: true 
      // se tiver documents: true no código
    } 
  });

  if (caso) {
    // clonei o objeto do Prisma e adicionamos o summary à força
    return {
      ...caso,
      summary: generateCaseSummary(caso)
    };
  }

  return null;
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

module.exports = { classifyCase, calculatePriority, createCaseFromTriage, getCasesByOffice, getCaseById, updateCase, updateCaseStatus };
