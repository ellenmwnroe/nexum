const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    const passwordHash = await bcrypt.hash('sua_senha_secreta', 10);

    // Primeiro criamos um escritório de teste
    const office = await prisma.office.create({
        data: { name: 'Pacelli Galvão Advocacia' }
    });

    // Depois criamos o seu usuário vinculado a esse escritório
    const lawyer = await prisma.lawyer.create({
        data: {
            name: 'Ellen Monroe',
            email: 'ellen@nexum.com.br',
            password: passwordHash,
            role: 'ADMIN',
            office_id: office.id
        }
    });

    console.log('✅ Advogado administrador criado com sucesso:', lawyer.email);
}

main();