const express = require("express");
const cors = require("cors");
const path = require("node:path");
const multer = require('multer');

// Imports
const authService = require('./services/auth.service');
const caseRoutes = require("./routes/case.routes");
const triagemRoutes = require("./routes/triagem.routes");
const caseController = require('./controllers/case.controller');
const officeRoutes = require("./routes/office.routes");
const lawyerRoutes = require("./routes/lawyer.routes");

// 1. INICIALIZAÇÃO DO APP
const app = express();
app.disable('x-powered-by');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // trocar pela URL real eventualmente
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // O que o Front pode fazer
  allowedHeaders: ['Content-Type', 'Authorization'] // Cabeçalhos permitidos
}));

app.use(express.json({ limit: '5mb' }));

// 2. CONFIGURAÇÃO DE PASTAS PÚBLICAS (Apenas 1 vez, do jeito certo)
app.use('/ficheiros', express.static(path.join(__dirname, '../uploads')));

// 3. CONFIGURAÇÃO DO MULTER (Upload de arquivos)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const nomeSeguro = Date.now() + '-' + file.originalname.replace(/\s/g, '_');
    cb(null, nomeSeguro);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});
const serverUrl = process.env.NODE_ENV === 'production'
  ? 'Servidor em Produção'
  : `http://localhost:${process.env.PORT || 3000}`;

// ---------------------------------------------------
// 4. ROTAS SOLTAS (Login e Upload)
// ---------------------------------------------------

// Rota de Login (Não precisa de token para logar, obviamente!)
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return res.json(result);
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
});

// Rota de Upload
app.post('/upload-documento', upload.array('documentos', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "Nenhum arquivo enviado" });
  }
  const nomesSalvos = req.files.map(file => file.filename).join(', ');
  res.json({ fileNames: nomesSalvos });
});

// Atualizar Status avulso (O ideal é ir pro case.routes depois)
app.patch('/cases/:id/status', caseController.updateStatus);


// ---------------------------------------------------
// 5. ROTAS DE MÓDULOS (Onde a mágica real acontece)
// ---------------------------------------------------
app.use("/cases", caseRoutes);
app.use("/triagem", triagemRoutes);
app.use("/office", officeRoutes);
app.use("/lawyer", lawyerRoutes);

// Compatibilidade com frontend (se ainda estiver usando /api)
app.use("/api/cases", caseRoutes);
app.use("/api/triagem", triagemRoutes);
app.use('/api/offices', officeRoutes);
app.use("/api/lawyers", lawyerRoutes);


// 6. LIGANDO O SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor Nexum rodando na porta ${PORT}`);
  console.log(`🔑 Login: ${serverUrl}/login`);
  console.log(`📡 Cases: ${serverUrl}/cases`);
  console.log(`📡 Triagem: ${serverUrl}/triagem`);
  console.log(`📡 Office: ${serverUrl}/office`);
});