import { useEffect, useState } from 'react';
import {
  User, Briefcase, Calendar,
  ChevronDown, ChevronUp, FileText, AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  priority?: string;
  summary?: string;
  created_at: string;
}

interface LawyerProfile {
  name: string;
  email: string;
  avatar_url?: string;
  role?: string;  
}

export const formatarCargo = (role?: string) => {
  switch (role) {
    case 'ADMIN': return 'Administrador(a)';
    case 'LAWYER': return 'Advogado(a)';
    case 'INTERN': return 'Estagiário(a)';
    case 'PARALEGAL': return 'Assistente Paralegal';
    case 'PARTNER': return 'Sócio(a)';
    default: return role || 'Advogado(a)';
  }
};

function Dashboard() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [perfil, setPerfil] = useState<LawyerProfile | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [casoAberto, setCasoAberto] = useState<CaseItem | null>(null);
  const [textosObservacao, setTextosObservacao] = useState<Record<string, string>>({});
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [ordenacao, setOrdenacao] = useState('recentes'); 
  const [filtroTipo, setFiltroTipo] = useState('TODOS');

  // O TOKEN FICA SOLTO AQUI PARA TODAS AS FUNÇÕES PODEREM USAR
  const token = localStorage.getItem('@Nexum:token');

  // 1. USE EFFECT DO PERFIL (Solto na raiz do componente)
  useEffect(() => {
    async function carregarPerfil() {
      if (!token) return; 
      
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/lawyers/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setPerfil(data); 
        }
      } catch (error) {
        console.error("Erro ao buscar perfil do advogado:", error);
      }
    }
    
    carregarPerfil();
  }, [token]);

  // 2. FUNÇÃO DE CARREGAR CASOS 
  const carregarCasos = async () => {
    try {
      const url = (filtroStatus && filtroStatus !== 'TODOS')
        ? `${import.meta.env.VITE_API_URL}/api/cases?status=${filtroStatus}`
        : `${import.meta.env.VITE_API_URL}/api/cases`;

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });

      if (res.ok) {
        const json = await res.json();
        setCases(json.data);
      } else if (res.status === 401) {
        console.error("Acesso Negado (401). Token ausente ou inválido.");
        alert("Sessão expirada. Por favor, faça login novamente.");
      }
    } catch (error) {
      console.error("Erro ao buscar casos do servidor:", error);
    }
  };

  // 3. USE EFFECT DOS CASOS
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

  const atualizarStatus = async (id: string, novoStatus: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cases/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: novoStatus }),
      });

      if (res.ok) {
        setCases(prev => prev.map(c => c.id === id ? { ...c, status: novoStatus } : c));
        alert("Status atualizado com sucesso!");
      } else if (res.status === 401) {
        alert("Sessão expirada. Faça login novamente.");
      }
    } catch (err) {
      console.error("Erro ao salvar status:", err);
    }
  };

  const salvarObservacao = async (id: string) => {
    const textoParaSalvar = textosObservacao[id];
    if (textoParaSalvar === undefined) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cases/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notes: textoParaSalvar }),
      });

      if (res.ok) {
        setCases(prev => prev.map(c => c.id === id ? { ...c, notes: textoParaSalvar } : c));
        alert("Observação salva com sucesso!");
      } else if (res.status === 401) {
        alert("Sessão expirada. Faça login novamente.");
      }
    } catch (err) {
      console.error("Erro ao salvar observação:", err);
    }
  };

  const mapaStatus: Record<string, string> = {
    'NOVO': 'Novo',
    'EM_ANALISE': 'Em Análise',
    'CONTATADO': 'Contatado',
    'CONTRATADO': 'Contratado',
    'DESCARTADO': 'Descartado'
  };

  const mapaTipos: Record<string, string> = {
    'RESCISAO': 'Rescisão',
    'FGTS': 'FGTS',
    'PEJOTIZACAO': 'Pejotização',
    'ASSÉDIO': 'Assédio',
    'HORAS_EXTRAS': 'Horas Extras',
    'VERBAS_PENDENTES': 'Verbas Pendentes',
    'GERAL_TRABALHISTA': 'Geral Trabalhista'
  };

  const mapaRespostas: Record<string, string> = {
    'sim': 'Sim',
    'nao': 'Não',
    'demitido_sem_justa_causa': 'Demissão sem justa causa',
    'demitido_justa_causa': 'Demissão por justa causa',
    'pedido_de_demissao': 'Pedido de demissão',
    'acordo': 'Acordo',
    'rescisao_indireta': 'Rescisão indireta',
    'pagou_tudo': 'Pagou tudo',
    'nao_pagou': 'Não pagou',
    'pagou_parcial': 'Pagou parcial',
    'faz_e_recebe': 'Faz e recebe',
    'faz_mas_nao_recebe': 'Faz mas não recebe',
    'nao_faz': 'Não faz'
  };

  
  const formatarResposta = (texto?: string) => {
    if (!texto) return 'Não informado';
    const chave = texto.toLowerCase();
    if (mapaRespostas[chave]) return mapaRespostas[chave];
    const limpo = texto.replaceAll('_', ' ');
    return limpo.charAt(0).toUpperCase() + limpo.slice(1);
  };

  let casosProcessados = cases.filter(c => {
    if (filtroTipo === 'TODOS') return true;
    const tipoDoCaso = c.case_type || 'GERAL_TRABALHISTA';
    return tipoDoCaso.includes(filtroTipo);
  });

  casosProcessados.sort((a, b) => {
    if (ordenacao === 'prioridade') {
      const pesos: Record<string, number> = { 'ALTA': 3, 'MEDIA': 2, 'BAIXA': 1 };
      const pesoA = pesos[a.priority || 'BAIXA'] || 0;
      const pesoB = pesos[b.priority || 'BAIXA'] || 0;;
      if (pesoA !== pesoB) return pesoB - pesoA;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const navigate = useNavigate();

  if (casoAberto) {
    return <DetalhesDoCaso casoBruto={casoAberto} onVoltar={() => setCasoAberto(null)} />;
  }

  // Puxa o nome dinâmico 
  const nomeUsuarioLogado = perfil?.name || "Carregando...";
  
  // Calcula as iniciais dinamicamente 
  const iniciaisUsuarioLogado = nomeUsuarioLogado.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* CABEÇALHO */}
        <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Painel de Processos</h1>
            <p className="text-slate-500 font-medium mt-1">Análise de leads e triagens em tempo real.</p>
          </div>

          <div className="flex items-center gap-4 bg-white p-2 pr-4 rounded-full border border-slate-200 shadow-sm">
            {perfil?.avatar_url ? (
              <img 
                src={perfil.avatar_url} 
                alt={`Foto de perfil de ${nomeUsuarioLogado}`}
                className="w-10 h-10 rounded-full object-cover shadow-inner shrink-0 border border-slate-100"
              />
            ) : (
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold tracking-widest shadow-inner shrink-0">
                {iniciaisUsuarioLogado}
              </div>
            )}
            <div className="flex flex-col mr-2">
              <span className="text-sm font-bold text-slate-900 leading-none">{nomeUsuarioLogado}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                {formatarCargo(perfil?.role)}
              </span>
            </div>
            <div className="w-px h-8 bg-slate-100 mx-1"></div>
            <button
              onClick={() => navigate('/configuracoes')}
              className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all"
              title="Configurações do Sistema"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
            </button>
          </div>
        </header>

        {/* BARRA DE FILTROS */}
        <div className="flex flex-wrap items-center gap-4 mb-8 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" /></svg>
            Filtros
          </span>

          <select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block p-2.5 font-medium cursor-pointer"
          >
            <option value="recentes">Mais Recentes</option>
            <option value="prioridade">Ordem de Importância</option>
          </select>

          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block p-2.5 font-medium cursor-pointer"
          >
            <option value="TODOS">Todos os Tipos</option>
            <option value="ASSÉDIO">Assédio</option>
            <option value="PEJOTIZACAO">Pejotização</option>
            <option value="HORAS_EXTRAS">Horas Extras</option>
            <option value="FGTS">FGTS / Rescisão</option>
            <option value="GERAL_TRABALHISTA">Geral Trabalhista</option>
          </select>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block p-2.5 font-medium cursor-pointer"
          >
            <option value="TODOS">Todos os Status</option>
            <option value="NOVO">Novos</option>
            <option value="EM_ANALISE">Em Análise</option>
            <option value="CONTATADO">Contatados</option>
            <option value="CONTRATADO">Contratados</option>
            <option value="DESCARTADO">Descartados</option>
          </select>
        </div>

        {/* LISTA DE CASOS */}
        <div className="grid gap-4">
          {casosProcessados.map((c) => {
            const userName = c.user?.name || "Cliente não identificado";
            const userInitial = userName.charAt(0).toUpperCase();
            const companyName = c.company || "Empresa não informada";
            const roleName = c.role || "Cargo não informado";

            return (
              <div
                key={c.id}
                className={`bg-white rounded-xl border transition-all duration-200 ${
                  expandedId === c.id ? 'border-blue-400 shadow-md ring-1 ring-blue-100' : 'border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {/* HEADER DO CARD */}
                <button
                    type="button"
                    className="w-full text-left p-5 cursor-pointer flex flex-wrap items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-xl"
                    onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                  >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center font-bold border border-slate-200 shrink-0">
                      {userInitial}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-slate-900">{userName}</h3>
                        {c.priority === 'ALTA' && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">ALTA</span>}
                        {c.priority === 'MEDIA' && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">MÉDIA</span>}
                        {(c.priority === 'BAIXA' || !c.priority) && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">BAIXA</span>}
                      </div>
                      <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
                        <Briefcase size={14} /> {companyName} • {roleName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Remuneração</p>
                      <p className="text-slate-900 font-bold">{formatCurrency(c.salary)}</p>
                    </div>

                    <div className="flex gap-2 flex-wrap justify-end">
                      {c.case_type ? (
                        c.case_type.split(', ').map((tipo) => (
                          <div key={tipo} className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-100">
                            {mapaTipos[tipo] || tipo.replaceAll('_', ' ')}
                          </div>
                        ))
                      ) : (
                        <div className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-500 border border-slate-200">
                          GERAL TRABALHISTA
                        </div>
                      )}
                    </div>

                    <div className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wide ${c.status === 'NOVO' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                      {mapaStatus[c.status] || c.status}
                    </div>

                    <div className="text-slate-400">
                      {expandedId === c.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </button>

                {/* DETALHES EXPANDIDOS */}
                {expandedId === c.id && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-6 rounded-b-xl animate-in fade-in slide-in-from-top-2">
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                      {/* Datas */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <h4 className="text-slate-900 font-bold text-sm flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
                          <Calendar size={16} className="text-blue-600"/> Período Contratual
                        </h4>
                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">Admissão / Demissão</p>
                        <p className="text-slate-800 font-medium text-sm">
                          {formatDate(c.admission_date)} — {c.resignation_date ? formatDate(c.resignation_date) : <span className="text-emerald-600 font-bold">Ativo</span>}
                        </p>
                      </div>

                      {/* Dados Pessoais */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <h4 className="text-slate-900 font-bold text-sm flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
                          <User size={16} className="text-blue-600"/> Identificação
                        </h4>
                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">CPF Registrado</p>
                        <p className="text-slate-800 font-medium text-sm">{c.user?.cpf || "Não informado"}</p>
                      </div>

                      {/* Insight */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <h4 className="text-slate-900 font-bold text-sm flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
                          <AlertTriangle size={16} className="text-amber-500"/> Insight Nexum
                        </h4>
                        {c.case_type?.includes('ASSÉDIO') && <p className="text-red-700 text-xs font-medium">⚠️ Fortes indícios de assédio. Potencial para Danos Morais.</p>}
                        {c.case_type?.includes('PEJOTIZACAO') && <p className="text-amber-700 text-xs font-medium">🚨 Falso PJ: Focar na comprovação de subordinação.</p>}
                        {c.case_type?.includes('HORAS_EXTRAS') && <p className="text-blue-700 text-xs font-medium">🕒 Horas extras: Verificar controle de ponto ou testemunhas.</p>}
                        {(c.case_type?.includes('FGTS') || c.case_type?.includes('RESCISAO')) && <p className="text-emerald-700 text-xs font-medium">💰 Verbas: Solicitar extrato analítico do FGTS.</p>}
                        {(!c.case_type || c.case_type === 'GERAL_TRABALHISTA') && <p className="text-slate-500 text-xs font-medium">Revisar detalhes para identificar passivos ocultos.</p>}
                      </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                      {/* Triagem */}
                      <div className="lg:col-span-2">
                        <h4 className="text-slate-900 font-bold text-sm flex items-center gap-2 mb-4">
                          <FileText size={18} className="text-blue-600" /> Resumo da Triagem
                        </h4>
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                          {c.triage_responses && c.triage_responses.length > 0 ? (
                            <table className="w-full text-sm text-left">
                              <tbody className="divide-y divide-slate-100">
                                {c.triage_responses.map((resp) => {
                                  const rotulo = dicionarioTriagem[resp.field_name] || resp.field_name;
                                  const valorFormatado = formatarResposta(resp.value);
                                  const isAlerta = (resp.field_name === 'carteira_assinada' && resp.value === 'nao') ||
                                                   (resp.field_name === 'salario_por_fora' && resp.value === 'sim') ||
                                                   (resp.field_name === 'horas_extras' && resp.value === 'faz_mas_nao_recebe') ||
                                                   (resp.field_name === 'fgts_rescisao' && resp.value.includes('nao'));

                                  return (
                                    <tr key={resp.field_name} className="hover:bg-slate-50 transition-colors">
                                      <td className="px-5 py-3.5 font-medium text-slate-600 w-2/3">{rotulo}</td>
                                      <td className="px-5 py-3.5 text-right">
                                        {resp.field_name === 'upload_docs' ? (
                                          <a href={`${import.meta.env.VITE_API_URL}/ficheiros/${resp.value}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-md text-xs bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-colors">
                                            Visualizar Documento
                                          </a>
                                        ) : (
                                          <span className={`inline-flex font-bold px-2.5 py-1 rounded text-xs ${isAlerta ? 'bg-red-50 text-red-700 border border-red-100' : 'text-slate-700 bg-slate-100 border border-slate-200'}`}>
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
                            <div className="p-6 text-center text-sm text-slate-400 italic">Questionário dinâmico não preenchido.</div>
                          )}
                        </div>
                      </div>

                      {/* CRM */}
                      <div className="space-y-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <h4 className="text-slate-900 font-bold text-sm flex items-center gap-2 mb-4">
                          <Briefcase size={18} className="text-blue-600" /> Gestão do Caso
                        </h4>

                        <div>
                          <label htmlFor={`status-${c.id}`} className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status do Lead</label>
                          <select
                            id={`status-${c.id}`}
                            defaultValue={c.status}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block p-2.5 font-medium shadow-sm cursor-pointer"
                            onChange={(e) => atualizarStatus(c.id, e.target.value)}
                          >
                            <option value="NOVO">Novo (Não lido)</option>
                            <option value="EM_ANALISE">Em Análise</option>
                            <option value="CONTATADO">Cliente Contatado</option>
                            <option value="CONTRATADO">Contrato Fechado</option>
                            <option value="DESCARTADO">Descartado</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor={`obs-${c.id}`} className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Observações</label>
                          <textarea
                            id={`obs-${c.id}`}
                            rows={3}
                            placeholder="Ex: Ligar amanhã às 14h..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none shadow-sm"
                            defaultValue={c.notes || ""}
                            onChange={(e) => setTextosObservacao({ ...textosObservacao, [c.id]: e.target.value })}
                          ></textarea>
                          <div className="flex justify-end mt-2">
                            <button onClick={() => salvarObservacao(c.id)} className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">Salvar Observação</button>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100">
                          <button
                            onClick={() => setCasoAberto(c)}
                            className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold text-sm hover:bg-blue-600 transition-colors shadow-sm flex items-center justify-center gap-2"
                          >
                            <FileText size={16} /> Gerar Peça e Dossiê
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {casosProcessados.length === 0 && (
            <div className="text-center py-20 text-slate-500 bg-white rounded-xl border border-slate-200">
              Nenhum caso encontrado com os filtros atuais.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;