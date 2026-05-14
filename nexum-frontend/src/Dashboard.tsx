import { useEffect, useState } from 'react';
import { 
  User, Briefcase, Calendar, 
  ChevronDown, ChevronUp, FileText, AlertTriangle 
} from 'lucide-react';
import DetalhesDoCaso from './DetalhesDoCaso';

interface CaseItem {
  id: string;
  user?: { name: string; cpf: string };
  company?: string;
  role?: string;
  salary?: number;
  admission_date?: string;
  resignation_date?: string;
  status: string;
  notes?: string;
  triage_responses?: { field_name: string; value: string }[];
  case_type?: string;
}

function Dashboard() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [casoAberto, setCasoAberto] = useState<CaseItem | null>(null);
  const [textosObservacao, setTextosObservacao] = useState<Record<string, string>>({});
  const [filtroStatus, setFiltroStatus] = useState(''); // Vazio significa "Todos"

  // Função que busca os dados no Back-end
  const carregarCasos = async () => {
    try {
      // Monta a URL dinâmica: se tiver filtro, adiciona o ?status=
      let url = 'http://localhost:3000/api/cases';
      if (filtroStatus) {
        url += `?status=${filtroStatus}`;
      }

      const res = await fetch(url);
      const payload = await res.json();
      
      // Garante que estamos pegando a lista de dentro de payload.data
      const listaFinal = Array.isArray(payload.data) ? payload.data : Array.isArray(payload) ? payload : [];
      setCases(listaFinal);
    } catch (err) {
      console.error("Erro ao buscar casos:", err);
    }
  };

  // O segredo da Story 3: toda vez que 'filtroStatus' mudar, o useEffect roda de novo!
  useEffect(() => {
    carregarCasos();
  }, [filtroStatus]);
  
  const formatCurrency = (value?: number) => {
    if (!value) return "Não informado";
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "--/--/----";
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  // Se tiver um caso aberto, esconde o Dashboard e mostra o Dossiê
  if (casoAberto) {
    return <DetalhesDoCaso casoBruto={casoAberto} onVoltar={() => setCasoAberto(null)} />;
  }

  const dicionarioTriagem: Record<string, string> = {
    carteira_assinada: "Trabalhava com carteira assinada?",
    salario_por_fora: "Recebia algum valor por fora?",
    subordinacao: "Havia subordinação e horário fixo?",
    horas_extras: "Fazia horas extras?",
    fgts_rescisao: "Situação do FGTS e Rescisão",
    situacao: "Como se deu o fim do vínculo?",
    condicoes_trabalho: "Sofreu algum tipo de assédio/risco?",
    verbas_pendentes: "Ficaram verbas pendentes?",
    observacoes: "Observações adicionais do cliente",
    upload_docs: "Documentos anexados"
  };

  // Formata os valores para ficarem com cara de texto normal
  const formatarValorResposta = (valor: string) => {
    if (!valor) return '-';
    if (valor.toLowerCase() === 'sim' || valor.toLowerCase() === 'nao') {
      return valor.charAt(0).toUpperCase() + valor.slice(1);
    }
    const limpo = valor.replace(/_/g, ' ');
    return limpo.charAt(0).toUpperCase() + limpo.slice(1);
  };

  const atualizarStatus = async (id: string, novoStatus: string) => {
  try {
    const res = await fetch(`http://localhost:3000/api/cases/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: novoStatus }),
    });

    if (res.ok) {
      // Atualiza a lista local para o advogado ver a mudança na hora
      setCases(prev => prev.map(c => c.id === id ? { ...c, status: novoStatus } : c));
      alert("Status atualizado com sucesso!");
    }
  } catch (err) {
    console.error("Erro ao salvar status:", err);
  }
};

  // Função para enviar a nota pro banco
  const salvarObservacao = async (id: string) => {
    const textoParaSalvar = textosObservacao[id];
    
    // Se não digitou nada de novo, não faz requisição à toa
    if (textoParaSalvar === undefined) return; 

    try {
      const res = await fetch(`http://localhost:3000/api/cases/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: textoParaSalvar }),
      });

      if (res.ok) {
        // Atualiza a lista visualmente
        setCases(prev => prev.map(c => c.id === id ? { ...c, notes: textoParaSalvar } : c));
        alert("Observação salva com sucesso!");
      }
    } catch (err) {
      console.error("Erro ao salvar observação:", err);
    }
  };
  
  return (
    <div className="min-h-screen bg-[#ecece5] p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-[#13233d] mb-2 tracking-tight">Nexum Dashboard</h1>
          <p className="text-gray-500 font-medium italic">Análise de leads e triagens em tempo real.</p>
        </header>

        <div className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-gray-100 mb-6">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Filtrar por:</span>
          <select 
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="bg-transparent text-sm font-bold text-[#3a4f99] outline-none cursor-pointer"
          >
            <option value="">📂 Todos os casos</option>
            <option value="NOVO">🟣 Novos</option>
            <option value="EM_ANALISE">⏳ Em Análise</option>
            <option value="CONTATADO">📞 Contatados</option>
            <option value="CONTRATADO">✅ Contratados</option>
            <option value="DESCARTADO">❌ Descartados</option>
          </select>
        </div>

        <div className="grid gap-6">
          {cases.map((c) => {
            // Criamos variáveis seguras para não quebrar o React
            const userName = c.user?.name || "Cliente não identificado";
            const userInitial = userName.charAt(0).toUpperCase();
            const companyName = c.company || "Empresa não informada";
            const roleName = c.role || "Cargo não informado";

            return (
              <div 
                key={c.id} 
                className={`bg-white rounded-2xl border transition-all duration-300 ${
                  expandedId === c.id ? 'border-[#3a4f99] shadow-xl' : 'border-gray-200 shadow-sm'
                }`}
              >
                {/* Header do Card - Infos Principais */}
                <div 
                  className="p-6 cursor-pointer flex flex-wrap items-center justify-between gap-4"
                  onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#3a4f99] rounded-full flex items-center justify-center text-[#d1d871] font-bold shadow-inner shrink-0">
                      {userInitial}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#13233d]">{userName}</h3>
                      <p className="text-sm text-gray-400 font-medium flex items-center gap-1">
                        <Briefcase size={14} /> {companyName} • {roleName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Remuneração</p>
                      <p className="text-[#13233d] font-bold">{formatCurrency(c.salary)}</p>
                    </div>

                    {/* 👈 MÚLTIPLAS ETIQUETAS: A CLASSIFICAÇÃO DA INTELIGÊNCIA */}
                      <div className="flex gap-2 flex-wrap justify-end">
                        {c.case_type ? (
                          // Corta a string nas vírgulas e gera um balão para cada um
                          c.case_type.split(', ').map((tipo, index) => (
                            <div 
                              key={index} 
                              className="px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-tighter bg-purple-100 text-purple-800 border border-purple-200"
                            >
                              {tipo.replace('_', ' ')}
                            </div>
                          ))
                        ) : (
                          // Caso antigo que ainda não tem classificação no banco
                          <div className="px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-tighter bg-gray-100 text-gray-500 border border-gray-200">
                            GERAL TRABALHISTA
                          </div>
                        )}
                      </div>

                    <div className={`px-4 py-1.5 rounded-lg font-bold text-xs uppercase tracking-tighter ${
                      c.status === 'NOVO' ? 'bg-[#d1d871] text-[#13233d]' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {c.status || "NOVO"}
                    </div>
                    {expandedId === c.id ? <ChevronUp className="text-gray-300" /> : <ChevronDown className="text-gray-300" />}
                  </div>
                </div>

                {/* Detalhes Expandidos */}
                {expandedId === c.id && (
                  <div className="border-t border-gray-100 bg-gray-50/50 p-6 rounded-b-2xl animate-in fade-in slide-in-from-top-2">
                    <div className="grid md:grid-cols-3 gap-8 mb-8">
                      {/* Coluna 1: Datas */}
                      <div className="space-y-3">
                        <h4 className="text-[#3a4f99] font-bold text-sm flex items-center gap-2">
                          <Calendar size={16} /> Período Contratual
                        </h4>
                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                          <p className="text-xs text-gray-400 font-bold uppercase">Admissão / Demissão</p>
                          <p className="text-[#13233d] font-medium tracking-tight">
                            {formatDate(c.admission_date)} — {c.resignation_date ? formatDate(c.resignation_date) : <span className="text-green-600">Vínculo Ativo</span>}
                          </p>
                        </div>
                      </div>

                      {/* Coluna 2: Dados Pessoais */}
                      <div className="space-y-3">
                        <h4 className="text-[#3a4f99] font-bold text-sm flex items-center gap-2">
                          <User size={16} /> Identificação
                        </h4>
                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                          <p className="text-xs text-gray-400 font-bold uppercase">CPF</p>
                          <p className="text-[#13233d] font-medium">{c.user?.cpf || "Não informado"}</p>
                        </div>
                      </div>

                      {/* Coluna 3: Insight Nexum */}
                      <div className="space-y-3">
                        <h4 className="font-bold text-sm flex items-center gap-2 text-orange-600">
                          <AlertTriangle size={16} /> Insight Nexum
                        </h4>
                        <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                          <p className="text-orange-800 text-xs font-bold leading-tight">
                            Revisar detalhes do vínculo para identificar passivos trabalhistas.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* DIVISOR: FERRAMENTAS DO ADVOGADO */}
                    <div className="mt-8 pt-8 border-t border-gray-200 grid lg:grid-cols-3 gap-8">
                      
                      {/* COLUNA 1 E 2: O OVERVIEW DA TRIAGEM */}
                      <div className="lg:col-span-2 space-y-4">
                        <h4 className="text-[#13233d] font-bold text-sm flex items-center gap-2 mb-4">
                          <FileText size={18} className="text-[#3a4f99]" /> 
                          Resumo da Triagem
                        </h4>
                        
                        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                          {c.triage_responses && c.triage_responses.length > 0 ? (
                            <table className="w-full text-sm text-left">
                              <tbody className="divide-y divide-gray-50">
                                {c.triage_responses.map((resp, idx) => {
                                  const rotulo = dicionarioTriagem[resp.field_name] || resp.field_name;
                                  const valorFormatado = formatarValorResposta(resp.value);
                                  
                                  // Lógica de cores: Destaca de vermelho o que é passivo trabalhista (bom pro advogado)
                                  const isAlerta = 
                                    (resp.field_name === 'carteira_assinada' && resp.value === 'nao') ||
                                    (resp.field_name === 'salario_por_fora' && resp.value === 'sim') ||
                                    (resp.field_name === 'horas_extras' && resp.value === 'faz_mas_nao_recebe') ||
                                    (resp.field_name === 'fgts_rescisao' && resp.value.includes('nao'));

                                  return (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                      {/* Coluna da Esquerda (A Pergunta) */}
                                      <td className="px-4 py-3 font-medium text-gray-600 w-2/3">
                                        {rotulo}
                                      </td>
                                      
                                      {/* Coluna da Direita (A Resposta ou o Botão de Arquivo) */}
                                      <td className="px-4 py-3 text-right">
                                        {resp.field_name === 'upload_docs' ? (
                                          <a 
                                            // ajustar essa URL para usar a variável do .env futuramente
                                            href={`http://localhost:3000/ficheiros/${resp.value}`} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-lg text-sm bg-blue-50 text-[#3a4f99] hover:bg-[#3a4f99] hover:text-white transition-colors"
                                          >
                                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                            </svg>
                                            Visualizar 
                                          </a>
                                        ) : (
                                          <span className={`inline-flex font-bold px-2.5 py-1 rounded-md text-xs ${
                                            isAlerta ? 'bg-red-50 text-red-700' : 'text-gray-700 bg-gray-100'
                                          }`}>
                                            {valorFormatado}
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                  
                                })}
                              </tbody>
                            </table>
                          ) : (
                            <div className="p-6 text-center text-sm text-gray-400 italic">
                              Questionário dinâmico não preenchido.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* COLUNA 3: AÇÕES RÁPIDAS (MINI-CRM) */}
                      <div className="space-y-5">
                        <h4 className="text-[#13233d] font-bold text-sm flex items-center gap-2 mb-4">
                          <Briefcase size={18} className="text-[#3a4f99]" /> 
                          Gestão do Caso
                        </h4>

                        {/* Dropdown de Status */}
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Status do Lead</label>
                            <select 
                              defaultValue={c.status} 
                              className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-lg focus:ring-[#3a4f99] focus:border-[#3a4f99] block p-2.5 font-medium shadow-sm cursor-pointer"
                              onChange={(e) => atualizarStatus(c.id, e.target.value)}
                            >
                              <option value="NOVO">Novo (Não lido)</option>
                              <option value="EM_ANALISE">Em Análise</option>
                              <option value="CONTATADO">Cliente Contatado</option>
                              <option value="CONTRATADO">Contrato Fechado</option>
                              <option value="DESCARTADO">Descartado</option>
                            </select>
                        </div>

                        {/* Bloco de Observações */}
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                            Observações do Caso
                          </label>
                          <textarea 
                            rows={3} 
                            placeholder="Ex: Ligar amanhã às 14h para pedir extrato do banco..."
                            className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#3a4f99] focus:border-transparent resize-none shadow-sm"
                            defaultValue={c.notes || ""} 
                            onChange={(e) => setTextosObservacao({ ...textosObservacao, [c.id]: e.target.value })}
                          ></textarea>
                          <div className="flex justify-end mt-2">
                            <button 
                              onClick={() => salvarObservacao(c.id)}
                              className="text-xs font-bold text-[#3a4f99] hover:text-[#13233d] transition-colors"
                            >
                              Salvar Observação
                            </button>
                          </div>
                        </div>

                        {/* Botão Principal Movido para a Lateral e Destacado */}
                        <div className="pt-2">
                          <button 
                            onClick={() => setCasoAberto(c)} 
                            className="w-full bg-[#13233d] text-[#d1d871] py-3 rounded-xl font-bold text-sm hover:bg-[#3a4f99] hover:text-white transition-all shadow-md flex items-center justify-center gap-2"
                          >
                            <FileText size={16} />
                            Gerar Peça e Dossiê
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          {cases.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              Nenhum caso recebido ainda. A lista será atualizada assim que houver triagens.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;