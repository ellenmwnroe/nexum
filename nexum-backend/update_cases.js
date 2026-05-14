const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. As nossas funções "Cerebrais" coladas aqui para o script enxergar
function normalizeText(text) {
  if (!text) return '';
  return text
    .normalize("NFD") 
    .replace(/[\u0300-\u036f]/g, "") 
    .toLowerCase(); 
}

function classifyCase(triageResponses) {
  const dictionary = {};
  triageResponses.forEach(r => { 
    dictionary[r.field_name] = normalizeText(r.value); 
  });

  const labels = [];

  if (dictionary.carteira_assinada?.includes('nao') && dictionary.subordinacao?.includes('sim')) {
    labels.push('PEJOTIZACAO');
  }

  if (
    dictionary.condicoes_trabalho?.includes('assedio') || 
    dictionary.condicoes_trabalho?.includes('humilha') ||
    dictionary.condicoes_trabalho?.includes('ofens') || 
    dictionary.condicoes_trabalho?.includes('xing') 
  ) {
    labels.push('ASSÉDIO');
  }

  if (dictionary.horas_extras?.includes('sim')) {
    labels.push('HORAS_EXTRAS');
  }

  if (dictionary.situacao?.includes('demiti') || dictionary.situacao?.includes('rescisao')) {
    labels.push('RESCISAO');
  }

  if (dictionary.fgts_rescisao?.includes('nao') || dictionary.fgts_rescisao?.includes('atrasad')) {
    labels.push('FGTS');
  }

  if (dictionary.verbas_pendentes?.includes('sim')) {
    labels.push('VERBAS_PENDENTES');
  }

  if (labels.length === 0) {
    labels.push('GERAL_TRABALHISTA');
  }

  return labels.join(', '); 
}

// 2. O Script que atualiza o banco
async function updateLegacyCases() {
  console.log("🚀 Iniciando reclassificação de casos antigos...");

  const cases = await prisma.case.findMany({
    where: { case_type: "GERAL_TRABALHISTA" },
    include: { triage_responses: true }
  });

  console.log(`Encontrados ${cases.length} casos para analisar...`);

  for (const c of cases) {
    const newType = classifyCase(c.triage_responses);

    if (newType !== "GERAL_TRABALHISTA") {
      await prisma.case.update({
        where: { id: c.id },
        data: { case_type: newType }
      });
      console.log(`✅ Caso ${c.id} atualizado para: ${newType}`);
    } else {
      console.log(`➖ Caso ${c.id} manteve-se como GERAL_TRABALHISTA`);
    }
  }

  console.log("✨ Todos os casos antigos foram processados!");
  
  // Desconecta do banco graciosamente
  await prisma.$disconnect();
}

updateLegacyCases();