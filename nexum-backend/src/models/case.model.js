class Case {
  constructor({
    nome,
    empresa,
    dataentra,
    datasai,
    motivo,
    salario,
    carteira,
    fgts,
    observacoes,
  }) {
    this.nome = nome;
    this.empresa = empresa;
    this.dataentra = dataentra;
    this.datasai = datasai;
    this.motivo = motivo;
    this.salario = salario;
    this.carteira = carteira;
    this.fgts = fgts;
    this.observacoes = observacoes;
    this.status = "novo";
  }
}

module.exports = Case;
