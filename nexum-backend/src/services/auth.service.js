const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// definir isso no .env
const JWT_SECRET = process.env.JWT_SECRET || 'chave_secreta_do_escritorio_nexum';

async function login(email, password) {
    // 1. Busca o Advogado/Funcionário pelo e-mail
    const lawyer = await prisma.lawyer.findUnique({
        where: { email },
        include: { office: true } // Opcional: traz os dados do escritório junto
    });

    // 2. Validação de existência
    if (!lawyer) {
        throw new Error('E-mail ou senha inválidos');
    }

    // 3. Validação da senha (compara o texto puro com o hash do banco)
    const passwordMatch = await bcrypt.compare(password, lawyer.password);

    if (!passwordMatch) {
        throw new Error('E-mail ou senha inválidos');
    }

    // 4. Geração do Token JWT
    // Inserimos o lawyerId e o officeId para filtrar os dados no futuro
    const token = jwt.sign(
        {
            lawyerId: lawyer.id,
            officeId: lawyer.office_id,
            role: lawyer.role
        },
        JWT_SECRET,
        { expiresIn: '12h' } // Tempo de validade do login
    );

    // 5. Retorno dos dados (sem a senha por segurança!)
    return {
        lawyer: {
            id: lawyer.id,
            name: lawyer.name,
            email: lawyer.email,
            role: lawyer.role,
            office: {
                id: lawyer.office.id,
                name: lawyer.office.name
            }
        },
        token
    };
}

module.exports = { login };