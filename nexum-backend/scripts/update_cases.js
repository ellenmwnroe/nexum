const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Nossas três funções de inteligência juntas
function normalizeText(text) {
  if (!text) return '';
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); 
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
  triageResponses.forEach(r => { dictionary[r.field_name] = normalizeText(r.value); });

  let score = 0;
  if (dictionary.condicoes_trabalho?.includes('assedio') || dictionary.condicoes_trabalho?.includes('humilha') || dictionary.condicoes_trabalho?.includes('ofens') || dictionary.condicoes_trabalho?.includes('xing')) score += 3;
  if (dictionary.carteira_assinada?.includes('nao') && dictionary.subordinacao?.includes('sim')) score += 2;
  if (dictionary.situacao?.includes('demiti') || dictionary.situacao?.includes('rescisao')) score += 1;
  if (dictionary.fgts_rescisao?.includes('nao') || dictionary.fgts_rescisao?.includes('atrasad')) score += 1;
  if (dictionary.horas_extras?.includes('sim')) score += 1;
  if (dictionary.verbas_pendentes?.includes('sim')) score += 1;

  if (score >= 3) return 'ALTA';
  if (score === 2) return 'MEDIA';
  return 'BAIXA';
}

// 2. O Script que atualiza o banco geral
async function updateLegacyCases() {
  console.log("🚀 Iniciando pente-fino em TODOS os casos (Tipo e Prioridade)...");

  // Pegamos TODOS os casos dessa vez, sem filtrar
  const cases = await prisma.case.findMany({
    include: { triage_responses: true }
  });

  console.log(`Encontrados ${cases.length} casos para analisar...`);

  for (const c of cases) {
    // Roda as duas inteligências
    const newType = classifyCase(c.triage_responses);
    const newPriority = calculatePriority(c.triage_responses);

    // Atualiza o banco com as duas informações
    await prisma.case.update({
      where: { id: c.id },
      data: { 
        case_type: newType,
        priority: newPriority
      }
    });
    
    console.log(`✅ Caso ${c.id} -> Tipo: ${newType} | Prioridade: ${newPriority}`);
  }

  console.log("✨ Banco de dados 100% atualizado com a nova inteligência!");
  
  await prisma.$disconnect();
}

updateLegacyCases();