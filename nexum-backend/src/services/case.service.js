const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// FUNÇÃO 1: CRIAR CASO VINDO DA TRIAGEM DO CHAT
async function createCaseFromTriage(dadosTriagem) {
  // 1. Separação Inteligente (Desestruturação)
  // Tiramos os dados fixos para criar o Cliente e o Caso.
  // Tudo o que sobrar cai na variável "...respostasDinamicas"
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
    office_id, // ID do escritório (vem do front-end ou do link da triagem)
    lgpd,      // Tiramos o aceite da LGPD para não poluir o banco
    ...respostasDinamicas
  } = dadosTriagem;

  // Trava de segurança básica
  if (!cpf || !nome) {
    throw new Error("Campos obrigatórios (Nome e CPF) estão ausentes.");
  }

  // 2. Limpeza do Salário (De "R$ 18.000,00" para 18000.00)
  let salarioNumerico = null;
  if (salario) {
    salarioNumerico = parseFloat(salario.replace(/[^\d,]/g, '').replace(',', '.'));
  }

  // 3. Transação Segura: Se algo der errado, ele cancela tudo e não salva pela metade
  const novoCaso = await prisma.$transaction(async (tx) => {
    
    // A) Salva ou Atualiza o Cliente baseado no CPF
    const user = await tx.user.upsert({
      where: { cpf: cpf },
      update: {
        phone: telefone,
        email: email, // Atualiza contatos se o cliente já existir no banco
      },
      create: {
        name: nome,
        cpf: cpf,
        rg: rg,
        phone: telefone,
        email: email,
        addresses: {
          create: { cep: cep, full_address: endereco_compl }
        }
      }
    });

    // Como você ainda vai configurar o login dos escritórios, 
    // coloquei um ID padrão só para o banco não dar erro caso o front não envie.
    const validOfficeId = office_id || "ESCRITORIO_PADRAO_TESTE";

    // B) Cria o Caso Principal
    const caseEntity = await tx.case.create({
      data: {
        user_id: user.id,
        office_id: validOfficeId,
        company: empresa,
        role: funcao,
        admission_date: data_admissao ? new Date(data_admissao) : null,
        resignation_date: data_demissao ? new Date(data_demissao) : null,
        salary: salarioNumerico,
        status: "NOVO",
      }
    });

    // C) Salva as respostas dinâmicas no banco de dados
    const arrayDeRespostas = Object.entries(respostasDinamicas).map(([campo, valor]) => ({
      case_id: caseEntity.id,
      field_name: campo,
      value: String(valor)
    }));

    if (arrayDeRespostas.length > 0) {
      await tx.triageResponse.createMany({
        data: arrayDeRespostas
      });
    }

    return caseEntity;
  });

  return novoCaso;
}

// FUNÇÃO 2: LISTAR OS CASOS NO DASHBOARD DO ADVOGADO
async function getCasesByOffice(officeId) {
  const casos = await prisma.case.findMany({
    where: {
      office_id: officeId
    },
    // Traz os dados do Cliente junto com a busca do Caso
    include: {
      user: {
        select: {
          name: true,
          cpf: true,
          phone: true
        }
      }
    },
    orderBy: {
      created_at: 'desc'
    }
  });

  return casos;
}

// Exportando as duas funções para serem usadas nos controllers
module.exports = { createCaseFromTriage, getCasesByOffice };