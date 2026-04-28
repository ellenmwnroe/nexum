const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database.sqlite");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      empresa TEXT,
      dataentra TEXT,
      datasai TEXT,
      motivo TEXT,
      salario REAL,
      carteira TEXT,
      fgts TEXT,
      observacoes TEXT,
      status TEXT
    )
  `);
});

module.exports = db;
