const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando a limpeza e configuração do banco profissional com dados de apresentação...');

  // 1. Limpeza rigorosa (Ordem de dependência)
  await prisma.caseEvent.deleteMany();
  await prisma.analysis.deleteMany();
  await prisma.document.deleteMany();
  await prisma.triageResponse.deleteMany();
  await prisma.case.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.lawyer.deleteMany();
  await prisma.office.deleteMany();

  console.log('🧹 Banco de dados limpo com sucesso.');

  // 2. Criar o Escritório
  const office = await prisma.office.create({
    data: {
      name: 'Marconi Franco Advocacia',
      primary_color: '#3a4f99',
    }
  });

  // 3. Criar o Advogado Titular
  const hashedPassword = await bcrypt.hash('Marconi2026@', 10);
  const lawyer = await prisma.lawyer.create({
    data: {
      name: 'Marconi Franco',
      email: 'marconifranco@nexum.com',
      password: hashedPassword,
      role: 'ADMIN',
      office_id: office.id,
    }
  });

  // ---------------------------------------------------------
  // 4. INJEÇÃO DE DADOS MOCKADOS (CASOS REAIS PARA O DASHBOARD)
  // ---------------------------------------------------------

  console.log('📝 Injetando casos processuais fictícios para o portfólio...');

  // CASO 1: Alta Prioridade (Assédio e Rescisão) - Vai disparar o alerta vermelho!
  const user1 = await prisma.user.create({
    data: { name: 'Mariana Duarte Souza', cpf: '111.222.333-44', phone: '(98) 98888-1111', email: 'mari.duarte@email.com' }
  });
  await prisma.case.create({
    data: {
      user_id: user1.id,
      office_id: office.id,
      assigned_lawyer_id: lawyer.id,
      company: 'Comércio Varejista Líder S.A.',
      role: 'Gerente de Vendas',
      salary: 4500.00,
      admission_date: new Date('2021-03-15T00:00:00Z'),
      resignation_date: new Date('2024-05-10T00:00:00Z'),
      status: 'NOVO',
      case_type: 'ASSÉDIO, RESCISAO',
      priority: 'ALTA',
      notes: 'Cliente chora muito ao relatar o caso. Prioridade no atendimento para evitar prescrição.',
      triage_responses: {
        create: [
          { field_name: 'carteira_assinada', value: 'sim' },
          { field_name: 'situacao', value: 'rescisao_indireta' },
          { field_name: 'condicoes_trabalho', value: 'sim_assedio_moral_e_metas_abusivas' },
          { field_name: 'fgts_rescisao', value: 'nao_depositou_fgts' },
          { field_name: 'observacoes', value: 'O gerente regional me humilhava na frente da equipe toda vez que a meta não era batida.' }
        ]
      }
    }
  });

  // CASO 2: Média Prioridade (Pejotização e Horas Extras) - Alerta laranja e azul
  const user2 = await prisma.user.create({
    data: { name: 'Carlos Henrique Tech', cpf: '555.666.777-88', phone: '(98) 99999-2222', email: 'carlos.dev@email.com' }
  });
  await prisma.case.create({
    data: {
      user_id: user2.id,
      office_id: office.id,
      assigned_lawyer_id: lawyer.id,
      company: 'Inova Solutions Tecnologia',
      role: 'Desenvolvedor Sênior',
      salary: 8200.00,
      admission_date: new Date('2022-08-01T00:00:00Z'),
      // Sem data de demissão (Vínculo Ativo!)
      status: 'EM_ANALISE',
      case_type: 'PEJOTIZACAO, HORAS_EXTRAS',
      priority: 'MEDIA',
      triage_responses: {
        create: [
          { field_name: 'carteira_assinada', value: 'nao' },
          { field_name: 'subordinacao', value: 'sim_horario_fixo_e_chefe_direto' },
          { field_name: 'horas_extras', value: 'faz_mas_nao_recebe' },
          { field_name: 'salario_por_fora', value: 'sim' },
          { field_name: 'observacoes', value: 'Me obrigaram a abrir um CNPJ (MEI) para me contratar, mas bato ponto das 08h às 18h como qualquer funcionário.' }
        ]
      }
    }
  });

  // CASO 3: Baixa Prioridade (Geral Trabalhista - Acordo) - Sem alertas críticos
  const user3 = await prisma.user.create({
    data: { name: 'Antônio Ferreira', cpf: '999.888.777-66', phone: '(98) 97777-3333' }
  });
  await prisma.case.create({
    data: {
      user_id: user3.id,
      office_id: office.id,
      assigned_lawyer_id: lawyer.id,
      company: 'Logística Rápida Brasil',
      role: 'Motorista Entregador',
      salary: 2100.00,
      admission_date: new Date('2023-01-10T00:00:00Z'),
      resignation_date: new Date('2024-01-20T00:00:00Z'),
      status: 'CONTATADO',
      case_type: 'GERAL_TRABALHISTA',
      priority: 'BAIXA',
      notes: 'Caso simples de verbas. O cliente quer tentar um acordo extrajudicial primeiro.',
      triage_responses: {
        create: [
          { field_name: 'carteira_assinada', value: 'sim' },
          { field_name: 'situacao', value: 'acordo' },
          { field_name: 'verbas_pendentes', value: 'multa_dos_40_por_cento' },
          { field_name: 'horas_extras', value: 'nao_faz' }
        ]
      }
    }
  });

  console.log('✅ 3 casos de portfólio criados com sucesso!');
  console.log('---------------------------------------------------');
  console.log(`🏢 Escritório: ${office.name}`);
  console.log(`📧 E-mail de login: ${lawyer.email}`);
  console.log(`🔑 Senha: Marconi2026@`);
  console.log('🚀 Banco profissional do Nexum está 100% pronto para a apresentação!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao criar dados:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });