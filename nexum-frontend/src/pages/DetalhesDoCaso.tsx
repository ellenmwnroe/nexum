export default function DetalhesDoCaso({ casoBruto, onVoltar }: { casoBruto: any, onVoltar: () => void }) {
  
  // 1. Tradutor de respostas da triagem
  const getResp = (campo: string) => casoBruto.triage_responses?.find((r: any) => r.field_name === campo)?.value || 'Não informado';

  const formatCurrency = (value?: number) => {
    if (!value) return "Não informado";
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "--/--/----";
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const moradaUser = casoBruto.user?.addresses?.[0];
  const enderecoCompleto = moradaUser 
    ? `${moradaUser.cep} - ${moradaUser.full_address}` 
    : "Endereço não informado";
    
  // 2. Montamos o objeto organizado
  const caso = {
    id: casoBruto.id,
    prioridade: casoBruto.priority || 'BAIXA',
    tipos: casoBruto.case_type ? casoBruto.case_type.split(', ') : ['GERAL_TRABALHISTA'],
    cliente: {
      nome: casoBruto.user?.name || "Cliente não identificado",
      cpf: casoBruto.user?.cpf || "Não informado",
      rg: casoBruto.user?.rg || "Não informado",
      telefone: casoBruto.user?.phone || "Não informado",
      email: casoBruto.user?.email || "Não informado",
      endereco: enderecoCompleto,
    },
    vinculo: {
      empresa: casoBruto.company || "Não informada",
      funcao: casoBruto.role || "Não informada",
      salario: formatCurrency(casoBruto.salary),
      admissao: formatDate(casoBruto.admission_date),
      demissao: casoBruto.resignation_date ? formatDate(casoBruto.resignation_date) : null,
      carteira_assinada: getResp('carteira_assinada'),
    },
    violacoes: {
      // Agora o mapa de violações puxa direto da nossa Inteligência do Back-end!
      pejotizacao: casoBruto.case_type?.includes('PEJOTIZACAO'),
      assedio: casoBruto.case_type?.includes('ASSÉDIO'),
      horas_extras: casoBruto.case_type?.includes('HORAS_EXTRAS'),
      fgts_rescisao: casoBruto.case_type?.includes('FGTS') || casoBruto.case_type?.includes('RESCISAO'),
    }
  };

  // 3. A NOSSA INTELIGÊNCIA DE RESUMO (Com Português Perfeito 📚)
  const gerarResumoLocal = () => {
    const carteira = caso.vinculo.carteira_assinada.toLowerCase() === 'sim' ? 'com carteira assinada' : 'sem carteira assinada';
    
    // Dicionário para arrumar os motivos de saída
    const mapaSituacao: Record<string, string> = {
      'demitido_sem_justa_causa': 'demissão sem justa causa',
      'demitido_justa_causa': 'demissão por justa causa',
      'pedido_de_demissao': 'pedido de demissão',
      'acordo': 'acordo',
      'rescisao_indireta': 'rescisão indireta'
    };
    
    // Dicionário para arrumar os agravantes/tipos de caso
    const mapaTipos: Record<string, string> = {
      'RESCISAO': 'problemas na rescisão',
      'FGTS': 'FGTS', // Mantém maiúsculo porque é sigla
      'PEJOTIZACAO': 'pejotização',
      'ASSÉDIO': 'assédio',
      'HORAS_EXTRAS': 'horas extras',
      'VERBAS_PENDENTES': 'verbas pendentes'
    };

    const sitBruta = getResp('situacao');
    // Tenta achar no dicionário. Se não achar, faz a limpeza básica
    const situacao = mapaSituacao[sitBruta] || sitBruta.replace(/_/g, ' ').toLowerCase();
    
    let texto = `O cliente ${caso.cliente.nome} trabalhou na empresa ${caso.vinculo.empresa} atuando como ${caso.vinculo.funcao}, ${carteira}. Informou que o fim do vínculo se deu por ${situacao}. `;
    
    // Traduzindo as etiquetas roxas para o texto do resumo
    const agravantes = caso.tipos
      .filter((t: string) => t !== 'GERAL_TRABALHISTA')
      .map((t: string) => mapaTipos[t] || t.replace(/_/g, ' ').toLowerCase());
    
    if (agravantes.length > 0) {
      texto += `O caso apresenta possíveis irregularidades relacionadas a: ${agravantes.join(', ')}.`;
    } else {
      texto += `Não foram relatados agravantes específicos na triagem inicial.`;
    }
    
    return texto;
  };

  const copiarParaPeticao = (texto: string) => {
    navigator.clipboard.writeText(texto);
    alert('Copiado para a área de transferência!');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-[#ecece5] min-h-screen font-sans">
      <button 
        onClick={onVoltar}
        className="flex items-center gap-2 text-gray-500 hover:text-[#3a4f99] font-bold text-sm mb-6 transition-colors"
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Voltar para a lista de casos
      </button>

      {/* 1. HEADER DO CASO TURBINADO */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#13233d]">{caso.cliente.nome}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-gray-500 font-medium mr-2">
              Caso #{caso.id?.substring(0, 8)}
            </span>
            
            {/* ETIQUETA DE PRIORIDADE */}
            {caso.prioridade === 'ALTA' && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">PRIORIDADE ALTA</span>}
            {caso.prioridade === 'MEDIA' && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">PRIORIDADE MÉDIA</span>}
            {caso.prioridade === 'BAIXA' && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">PRIORIDADE BAIXA</span>}
            
            {/* ETIQUETAS DO TIPO DE CASO */}
            {caso.tipos.map((tipo: string, index: number) => (
              <span key={index} className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-100 text-purple-800 border border-purple-200">
                {tipo.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border-2 border-[#3a4f99] text-[#3a4f99] px-4 py-2 rounded-xl font-bold hover:bg-[#3a4f99] hover:text-white transition-colors">
            Gerar Procuração
          </button>
          <button className="bg-[#3a4f99] text-white px-4 py-2 rounded-xl font-bold hover:bg-[#13233d] transition-colors">
            Iniciar Peça
          </button>
        </div>
      </div>

      {/* 2. BLOCO DE RESUMO DO CASO (Garantido de aparecer) */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 mb-8 shadow-sm">
        <div className="flex justify-between items-start mb-3">
          <h4 className="text-xs font-bold text-blue-800 uppercase tracking-widest flex items-center gap-2">
              💡 Resumo da Triagem
          </h4>
          <button 
            onClick={() => copiarParaPeticao(gerarResumoLocal())}
            className="text-blue-600 hover:text-blue-800 text-[10px] font-bold flex items-center gap-1 uppercase"
          >
            Copiar Resumo
          </button>
        </div>
        <p className="text-[#13233d] font-medium text-sm leading-relaxed">
          {gerarResumoLocal()}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUNA ESQUERDA: Dados do Cliente e Empresa */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* CARD: Vínculo Empregatício */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
            <button 
              onClick={() => copiarParaPeticao(`O Reclamante foi admitido pela Reclamada em ${caso.vinculo.admissao} para exercer a função de ${caso.vinculo.funcao}, percebendo como último salário a quantia de ${caso.vinculo.salario}.`)}
              className="absolute top-6 right-6 text-[#3a4f99] hover:text-[#13233d] text-sm font-bold flex items-center gap-1 cursor-pointer"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              Copiar Fato
            </button>
            
            <h2 className="text-lg font-bold text-[#13233d] mb-5 border-b border-gray-100 pb-3">Contrato de Trabalho</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
              <div>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Empresa</p>
                <p className="text-md font-semibold text-gray-800">{caso.vinculo.empresa}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Função</p>
                <p className="text-md font-semibold text-gray-800">{caso.vinculo.funcao}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Salário Base</p>
                <p className="text-md font-semibold text-gray-800">{caso.vinculo.salario}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Admissão</p>
                <p className="text-md font-semibold text-gray-800">{caso.vinculo.admissao}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Demissão</p>
                {caso.vinculo.demissao ? (
                  <p className="text-md font-semibold text-red-600">{caso.vinculo.demissao}</p>
                ) : (
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">Vínculo Ativo</span>
                )}
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Modalidade</p>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${caso.vinculo.carteira_assinada === 'sim' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                  {caso.vinculo.carteira_assinada === 'sim' ? 'CLT' : 'PJ / Sem Registro'}
                </span>
              </div>
            </div>
          </div>

          {/* CARD: Mapa de Violações (Agora Inteligente!) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-[#13233d] mb-5 border-b border-gray-100 pb-3">Análise de Violações</h2>
            
            <div className="space-y-4">
              {caso.violacoes.pejotizacao && (
                 <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <p className="font-semibold text-orange-800 text-sm">Falso PJ Identificado (Subordinação relatada)</p>
                 </div>
              )}
              {caso.violacoes.fgts_rescisao && (
                 <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <p className="font-semibold text-red-800 text-sm">Irregularidade no FGTS ou Verbas Rescisórias</p>
                 </div>
              )}
               {caso.violacoes.horas_extras && (
                 <div className="flex items-center gap-3 p-3 bg-[#3a4f99]/10 rounded-lg border border-[#3a4f99]/20">
                    <div className="w-2 h-2 rounded-full bg-[#3a4f99]"></div>
                    <p className="font-semibold text-[#3a4f99] text-sm">Horas Extras inadimplidas</p>
                 </div>
              )}
              {caso.violacoes.assedio && (
                 <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                    <p className="font-semibold text-purple-800 text-sm">Relatos de Assédio ou Más Condições</p>
                 </div>
              )}
              {!caso.violacoes.pejotizacao && !caso.violacoes.fgts_rescisao && !caso.violacoes.horas_extras && !caso.violacoes.assedio && (
                <p className="text-sm text-gray-500 italic">Nenhuma violação grave detectada automaticamente. Verifique as notas da triagem.</p>
              )}
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: Qualificação e Contato (Seu código original mantido perfeito) */}
        <div className="space-y-6">
          <div className="bg-[#13233d] p-6 rounded-2xl shadow-sm text-white">
             <h2 className="text-lg font-bold text-[#d1d871] mb-5 border-b border-white/10 pb-3">Qualificação do Cliente</h2>
             
             <div className="space-y-4">
               <div>
                 <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">CPF</p>
                 <p className="text-sm font-semibold">{caso.cliente.cpf}</p>
               </div>
               <div>
                 <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">RG</p>
                 <p className="text-sm font-semibold">{caso.cliente.rg}</p>
               </div>
               <div>
                 <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Endereço</p>
                 <p className="text-sm font-semibold">{caso.cliente.endereco}</p>
               </div>
             </div>
             
             <button 
              onClick={() => copiarParaPeticao(`${caso.cliente.nome}, brasileiro(a), portador(a) do RG nº ${caso.cliente.rg} e inscrito(a) no CPF sob o nº ${caso.cliente.cpf}, residente e domiciliado(a) na ${caso.cliente.endereco}...`)}
              className="mt-6 w-full bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl text-sm font-bold transition-colors"
            >
               Copiar Qualificação
             </button>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
             <h2 className="text-lg font-bold text-[#13233d] mb-2 w-full text-left">Contato Rápido</h2>
             
             <p className="text-2xl font-black text-[#3a4f99] tracking-tight mb-4">
               {caso.cliente.telefone}
             </p>

             <a 
               href={
                 caso.cliente.telefone !== "Não informado" 
                   ? `https://wa.me/${
                       caso.cliente.telefone.startsWith('+') 
                         ? caso.cliente.telefone.replace(/\D/g, '') 
                         : '55' + caso.cliente.telefone.replace(/\D/g, '') 
                     }` 
                   : '#'
               } 
               target="_blank" 
               rel="noreferrer" 
               className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold transition-colors shadow-sm ${
                 caso.cliente.telefone !== "Não informado" 
                   ? 'bg-[#25D366] hover:bg-[#1ebe5d] text-white' 
                   : 'bg-gray-200 text-gray-400 cursor-not-allowed'
               }`}
             >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                Chamar no WhatsApp
             </a>
             <p className="text-center text-xs text-gray-500 mt-3 font-medium bg-gray-50 w-full py-2 rounded-lg">{caso.cliente.email}</p>
          </div>
        </div>

      </div>
    </div>
  );
}