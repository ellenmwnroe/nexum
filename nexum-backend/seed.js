const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Limpando dados antigos do banco...');
  // A ordem de exclusão importa para não quebrar os vínculos (Foreign Keys)
  await prisma.caseEvent.deleteMany();
  await prisma.document.deleteMany();
  await prisma.triageResponse.deleteMany();
  await prisma.case.deleteMany();
  await prisma.lawyer.deleteMany();
  await prisma.office.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  console.log('⚙️ Iniciando a configuração inicial do banco...');

  // 1. Criar Escritório
  const office = await prisma.office.create({
    data: { name: 'Nexum Advocacia Sede' }
  });

  // 2. Criar Advogado/Admin
  const passwordHash = await bcrypt.hash('senha123', 10);
  const admin = await prisma.lawyer.create({
    data: {
      name: 'Ellen Monroe',
      email: 'ellen@nexum.com.br',
      password: passwordHash,
      role: 'ADMIN',
      office_id: office.id
    }
  });

  // 3. Criar um Cliente (User) de teste
  const clienteDeTeste = await prisma.user.create({
    data: {
      name: 'João Trabalhador da Silva',
      cpf: '111.222.333-44',
      email: 'joao.trabalhador@email.com',
      phone: '98999999999'
    }
  });

  // 4. Criar Casos populados e vinculados automaticamente
  console.log('📂 Gerando casos de teste...');
  await prisma.case.createMany({
    data: [
      {
        user_id: clienteDeTeste.id,
        office_id: office.id,
        assigned_lawyer_id: admin.id, // O caso já cai para você!
        company: 'Empresa Fictícia S.A.',
        role: 'Desenvolvedor Pleno',
        status: 'NOVO',
        case_type: 'GERAL_TRABALHISTA',
        priority: 'ALTA',
        notes: 'Cliente relata horas extras não pagas.'
      },
      {
        user_id: clienteDeTeste.id,
        office_id: office.id,
        company: 'Indústria Metálica LTDA',
        role: 'Operador de Máquina',
        status: 'EM_ANALISE',
        case_type: 'ACIDENTE_DE_TRABALHO',
        priority: 'MEDIA'
      }
    ]
  });

  console.log('\n✅ Banco de dados populado com sucesso!');
  console.log('--------------------------------------------------');
  console.log('🏢 Escritório:', office.name);
  console.log('👤 E-mail do Admin:', admin.email);
  console.log('🔑 Senha:', 'senha123');
  console.log('📊 Casos criados: 2');
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao rodar o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });