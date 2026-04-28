const express = require("express");
const cors = require("cors");

const caseRoutes = require("./routes/case.routes");
const triagemRoutes = require("./routes/triagem.routes");

const app = express();

app.use(cors());
app.use(express.json());

// Endpoints do Sprint 1
app.use("/cases", caseRoutes);
app.use("/triagem", triagemRoutes);

// Compatibilidade com prefixo /api já usado no frontend atual
app.use("/api/cases", caseRoutes);
app.use("/api/triagem", triagemRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor Nexum rodando na porta ${PORT}`);
  console.log(`📡 Cases: http://localhost:${PORT}/cases`);
  console.log(`📡 Triagem: http://localhost:${PORT}/triagem`);
});
