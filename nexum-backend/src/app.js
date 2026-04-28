const express = require("express");
const cors = require("cors");

// Importando os seus arquivos de rotas
const caseRoutes = require("./routes/case.routes");
const triagemRoutes = require("./routes/triagem.routes");

const app = express();

// 1. Configurações de Segurança e JSON (Sempre antes das rotas!)
app.use(cors()); 
app.use(express.json()); 

// 2. Conectando as Rotas (Usando app.use em vez de app.post)
// Tudo que for para /api/cases vai para o arquivo case.routes.js
app.use("/api/cases", caseRoutes);

// Tudo que for para /api/triagem vai para o arquivo triagem.routes.js
app.use("/api/triagem", triagemRoutes);

// 3. Ligando o Servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor Nexum rodando na porta ${PORT}`);
  console.log(`📡 Cases: http://localhost:${PORT}/api/cases`);
  console.log(`📡 Triagem: http://localhost:${PORT}/api/triagem`);
});