const db = require("../database/db");

function createCase(caseData) {
  return new Promise((resolve, reject) => {
    const {
      nome,
      empresa,
      dataentra,
      datasai,
      motivo,
      salario,
      carteira,
      fgts,
      observacoes,
      status,
    } = caseData;

    db.run(
      `INSERT INTO cases (nome, empresa, dataentra, datasai, motivo, salario, carteira, fgts, observacoes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nome,
        empresa,
        dataentra,
        datasai,
        motivo,
        salario,
        carteira,
        fgts,
        observacoes,
        status,
      ],
      function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, ...caseData });
      },
    );
  });
}

function getCases() {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM cases`, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

module.exports = { createCase, getCases };
