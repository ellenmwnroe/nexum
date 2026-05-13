const express = require("express");
const cors = require("cors");
const caseRoutes = require("./routes/case.routes");
const triagemRoutes = require("./routes/triagem.routes");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
// Libera a pasta 'uploads' para ser acessada publicamente através do link '/ficheiros'
app.use('/ficheiros', express.static(path.join(__dirname, '../uploads')));

// Endpoints do Sprint 1
app.use("/cases", caseRoutes);
app.use("/triagem", triagemRoutes);

// Compatibilidade com prefixo /api já usado no frontend atual
app.use("/api/cases", caseRoutes);
app.use("/api/triagem", triagemRoutes);


// Diz ao Express para servir os ficheiros da pasta 'uploads' como links estáticos
app.use('/ficheiros', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 3000;

const multer = require('multer');

// Configura o Multer para salvar na pasta 'uploads' sem mudar a extensão
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // 👈 A pasta que você acabou de criar
  },
  filename: function (req, file, cb) {
    // Cria um nome único e seguro: Hora exata + nome original do arquivo
    const nomeSeguro = Date.now() + '-' + file.originalname.replace(/\s/g, '_');
    cb(null, nomeSeguro);
  }
});
const upload = multer({ storage: storage });

// A Rota Mágica que recebe o arquivo do Front-end
// A Rota Mágica que recebe VÁRIOS arquivos (limite de 10 por vez)
// A Rota Mágica que recebe VÁRIOS arquivos
app.post('/upload-documento', upload.array('documentos', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "Nenhum arquivo enviado" });
  }
  
  const nomesSalvos = req.files.map(file => file.filename).join(', ');
  res.json({ fileNames: nomesSalvos });
});
app.listen(PORT, () => {
  console.log(`🚀 Servidor Nexum rodando na porta ${PORT}`);
  console.log(`📡 Cases: http://localhost:${PORT}/cases`);
  console.log(`📡 Triagem: http://localhost:${PORT}/triagem`);
});
