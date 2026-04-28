const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const triagemRoutes = require("./routes/triagem.routes");
app.use("/triagem", triagemRoutes);

const caseRoutes = require("./routes/case.routes");
app.use("/cases", caseRoutes);

app.listen(3001, () => {
  console.log("Servidor rodando");
});
