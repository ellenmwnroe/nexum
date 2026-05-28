const jwt = require('jsonwebtoken');

// A mesma senha secreta que você usou no auth.service.js
const JWT_SECRET = process.env.JWT_SECRET || 'chave_secreta_do_escritorio_nexum';

function ensureAuthenticated(req, res, next) {
  // 1. Pega o "crachá" que vem no cabeçalho da requisição
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não enviado.' });
  }

  // O formato padrão é "Bearer seutokengiganteaqui", então separamos pelo espaço
  const [, token] = authHeader.split(' ');

  try {
    // 2. Valida se o crachá é verdadeiro e não expirou
    const decoded = jwt.verify(token, JWT_SECRET);

    // 3. Cola as informações do advogado na requisição para as próximas rotas poderem usar
    req.lawyerId = decoded.lawyerId;
    req.officeId = decoded.officeId;
    req.userRole = decoded.role;

    // 4. Manda o fluxo seguir em frente (acesso liberado!)
    return next();
  } catch (err) {
    console.error('Falha na validação do token JWT:', err.message);
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}

module.exports = { ensureAuthenticated };