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

function Dashboard() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [casoAberto, setCasoAberto] = useState<CaseItem | null>(null);
  const [textosObservacao, setTextosObservacao] = useState<Record<string, string>>({});
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [ordenacao, setOrdenacao] = useState('recentes'); // 'recentes' ou 'prioridade'
  const [filtroTipo, setFiltroTipo] = useState('TODOS');

  // Função que busca os casos blindados no Back-end
  const carregarCasos = async () => {
    try {
      // 1. Pega a "Pulseira VIP" (Token) que o Login salvou
      const token = localStorage.getItem('@Nexum:token');

      // Se você envia o filtro para o back-end, a URL muda dinamicamente:
      const url = (filtroStatus && filtroStatus !== 'TODOS')
        ? `${import.meta.env.VITE_API_URL}/api/cases?status=${filtroStatus}`
        : `${import.meta.env.VITE_API_URL}/api/cases`;

      // 2. Bate na porta do servidor mostrando o crachá
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // 👈 A mágica que resolve o erro 401!
        }
      });

      if (res.ok) {
        // 3. Lê o pacote que o Back-end mandou
        const json = await res.json();

        // 4. Salva APENAS a lista de casos (json.data) no estado do React
        setCases(json.data);
      } else if (res.status === 401) {
        // Se o token expirou ou é inválido
        console.error("Acesso Negado (401). Token ausente ou inválido.");
        alert("Sessão expirada. Por favor, faça login novamente.");
      }
    } catch (error) {
      console.error("Erro ao buscar casos do servidor:", error);
    }
  };

  // toda vez que 'filtroStatus' mudar, ou a tela carregar, ele roda
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
      // 1. Pega o token salvo no login
      const token = localStorage.getItem('@Nexum:token');

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cases/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // 👈 Mostrando o crachá para o Back-end!
        },
        body: JSON.stringify({ status: novoStatus }),
      });

      if (res.ok) {
        setCases(prev => prev.map(c => c.id === id ? { ...c, status: novoStatus } : c));
        alert("Status updated successfully!");
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
      // 1. Pega o token salvo no login
      const token = localStorage.getItem('@Nexum:token');

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

  // 1. Dicionário de Status
  const mapaStatus: Record<string, string> = {
    'NOVO': 'Novo',
    'EM_ANALISE': 'Em Análise',
    'CONTATADO': 'Contatado',
    'CONTRATADO': 'Contratado',
    'DESCARTADO': 'Descartado'
  };

  // 2. Dicionário de Tipos de Caso
  const mapaTipos: Record<string, string> = {
    'RESCISAO': 'Rescisão',
    'FGTS': 'FGTS',
    'PEJOTIZACAO': 'Pejotização',
    'ASSÉDIO': 'Assédio',
    'HORAS_EXTRAS': 'Horas Extras',
    'VERBAS_PENDENTES': 'Verbas Pendentes',
    'GERAL_TRABALHISTA': 'Geral Trabalhista'
  };

  // 3. Dicionário de Respostas (Para o sim/nao e opções dos selects)
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

  // Função mágica para as respostas da triagem
  const formatarResposta = (texto?: string) => {
    if (!texto) return 'Não informado';
    const chave = texto.toLowerCase();
    // Se a palavra estiver no dicionário, devolve ela bonita.
    if (mapaRespostas[chave]) return mapaRespostas[chave];

    // Se não estiver (ex: um texto livre que o cliente digitou),
    // apenas capitaliza a primeira letra e tira os underlines, se houver.
    const limpo = texto.replaceAll(/_/g, ' ');
    return limpo.charAt(0).toUpperCase() + limpo.slice(1);
  };


  let casosProcessados = cases.filter(c => {
    if (filtroTipo === 'TODOS') return true;

    // Se o caso for vazio ou null, consideramos como Geral
    const tipoDoCaso = c.case_type || 'GERAL_TRABALHISTA';
    return tipoDoCaso.includes(filtroTipo);
  });

  // 2. Depois a gente ORDENA a lista que sobrou
  casosProcessados.sort((a, b) => {
    if (ordenacao === 'prioridade') {
      // Damos um "peso" para cada prioridade para o JavaScript saber quem ganha
      const pesos: Record<string, number> = { 'ALTA': 3, 'MEDIA': 2, 'BAIXA': 1 };
      const pesoA = pesos[a.priority || 'BAIXA'] || 0;
      const pesoB = pesos[b.priority || 'BAIXA'] || 0;;

      if (pesoA !== pesoB) {
        return pesoB - pesoA; // Do maior pro menor (Alta primeiro)
      }
    }

    // Se a ordenação for por 'recentes' (ou se a prioridade der empate),
    // ordena pela data de criação (do mais novo pro mais velho)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const navigate = useNavigate();

  // Se tiver um caso aberto, esconde o Dashboard e mostra o Dossiê
  if (casoAberto) {
    return <DetalhesDoCaso casoBruto={casoAberto} onVoltar={() => setCasoAberto(null)} />;
  }

  return (
    <div className="min-h-screen bg-[#ecece5] p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Lado Esquerdo: Títulos */}
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-[#13233d] mb-1 md:mb-2 tracking-tight">Nexum Dashboard</h1>
            <p className="text-sm md:text-base text-gray-500 font-medium italic">Análise de leads e triagens em tempo real.</p>
          </div>

          {/* Lado Direito: Perfil e Configurações responsivo */}
          <div className="w-full md:w-auto flex items-center justify-between md:justify-start gap-3 bg-white p-2 pr-4 rounded-full border border-gray-200 shadow-sm shrink-0">

            {/* Agrupamento do Avatar e Nome para ficarem juntos na esquerda no mobile */}
            <div className="flex items-center gap-3">
              {/* Avatarzinho (Iniciais) */}
              <div className="w-10 h-10 bg-[#13233d] text-white rounded-full flex items-center justify-center font-bold tracking-widest shadow-inner shrink-0">
                EM
              </div>

              {/* Nome e Cargo (Agora sempre visível) */}
              <div className="flex flex-col mr-2">
                <span className="text-sm font-bold text-[#13233d] leading-none">Ellen Monroe</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Admin</span>
              </div>
            </div>

            {/* Linha Divisória (Só aparece no PC) */}
            <div className="hidden md:block w-px h-8 bg-gray-100 mx-1"></div>

            {/* Botão de Configurações Elegante (Fica na extrema direita no mobile) */}
            <button
              onClick={() => navigate('/configuracoes')}
              className="p-2 text-gray-400 hover:text-[#13233d] hover:bg-gray-50 rounded-full transition-all duration-300 shrink-0"
              title="Configurações do Sistema"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
            </button>

          </div>
        </header>

        {/* BARRA DE FILTROS */}
        <div className="flex flex-wrap items-center gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" /></svg>
            Filtros
          </span>

          {/* Filtro de Ordenação */}
          <select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#3a4f99] focus:border-[#3a4f99] block p-2.5 font-medium cursor-pointer"
          >
            <option value="recentes">Mais Recentes</option>
            <option value="prioridade">Ordem de Importância</option>
          </select>

          {/* Filtro de Tipo de Caso */}
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#3a4f99] focus:border-[#3a4f99] block p-2.5 font-medium cursor-pointer"
          >
            <option value="TODOS">Todos os Tipos</option>
            <option value="ASSÉDIO">Assédio</option>
            <option value="PEJOTIZACAO">Pejotização</option>
            <option value="HORAS_EXTRAS">Horas Extras</option>
            <option value="FGTS">FGTS / Rescisão</option>
            <option value="GERAL_TRABALHISTA">Geral Trabalhista</option>
          </select>

          {/* Filtro de Status */}
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#3a4f99] focus:border-[#3a4f99] block p-2.5 font-medium cursor-pointer"
          >
            <option value="TODOS">Todos os Status</option>
            <option value="NOVO">Novos</option>
            <option value="EM_ANALISE">Em Análise</option>
            <option value="CONTATADO">Contatados</option>
            <option value="CONTRATADO">Contratados</option>
            <option value="DESCARTADO">Descartados</option>
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
                className={`bg-white rounded-2xl border transition-all duration-300 ${expandedId === c.id ? 'border-[#3a4f99] shadow-xl' : 'border-gray-200 shadow-sm'
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
                      {/* O flex flex-wrap alinha o nome e a prioridade */}
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <h3 className="text-xl font-bold text-[#13233d]">{userName}</h3>

                        {/* AS ETIQUETAS DE PRIORIDADE */}
                        {c.priority === 'ALTA' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                            ALTA
                          </span>
                        )}
                        {c.priority === 'MEDIA' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">
                            MÉDIA
                          </span>
                        )}
                        {(c.priority === 'BAIXA' || !c.priority) && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                            BAIXA
                          </span>
                        )}
                      </div>

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

                    {/* ETIQUETAS: TIPO DE CASO */}
                    <div className="flex gap-2 flex-wrap justify-end">
                      {c.case_type ? (
                        c.case_type.split(', ').map((tipo, index) => (
                          <div
                            key={index}
                            className="px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-tighter bg-purple-100 text-purple-800 border border-purple-200"
                          >
                            {mapaTipos[tipo] || tipo.replace(/_/g, ' ')}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-tighter bg-gray-100 text-gray-500 border border-gray-200">
                          GERAL TRABALHISTA
                        </div>
                      )}
                    </div>

                    {/* ETIQUETA: STATUS DO LEAD */}
                    <div className={`px-4 py-1.5 rounded-lg font-bold text-xs uppercase tracking-tighter ${c.status === 'NOVO' ? 'bg-[#d1d871] text-[#13233d]' : 'bg-blue-100 text-blue-800'
                      }`}>
                      {mapaStatus[c.status] || c.status}
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
                        <h4 className="font-bold text-sm flex items-center gap-2 text-orange-600 mb-4">
                          <AlertTriangle size={16} /> Insight Nexum
                        </h4>

                        {/* Dica para Assédio */}
                        {c.case_type?.includes('ASSÉDIO') && (
                          <div className="bg-red-50 p-3 rounded-xl border border-red-100 shadow-sm">
                            <p className="text-red-800 text-xs font-bold leading-tight">
                              ⚠️ Atenção: Fortes indícios de assédio. Alto potencial para Danos Morais. Oriente a reunir provas.
                            </p>
                          </div>
                        )}

                        {/* Dica para Pejotização */}
                        {c.case_type?.includes('PEJOTIZACAO') && (
                          <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 shadow-sm">
                            <p className="text-orange-800 text-xs font-bold leading-tight">
                              🚨 Falso PJ: Focar na comprovação de subordinação e habitualidade.
                            </p>
                          </div>
                        )}

                        {/* Dica para Horas Extras */}
                        {c.case_type?.includes('HORAS_EXTRAS') && (
                          <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 shadow-sm">
                            <p className="text-blue-800 text-xs font-bold leading-tight">
                              🕒 Horas extras: Verificar se havia controle de ponto ou testemunhas da jornada.
                            </p>
                          </div>
                        )}

                        {/* Dica para FGTS / Rescisão */}
                        {(c.case_type?.includes('FGTS') || c.case_type?.includes('RESCISAO')) && (
                          <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100 shadow-sm">
                            <p className="text-yellow-800 text-xs font-bold leading-tight">
                              💰 Verbas: Solicitar o extrato analítico do FGTS via APP da Caixa.
                            </p>
                          </div>
                        )}

                        {/* Caso Geral */}
                        {(!c.case_type || c.case_type === 'GERAL_TRABALHISTA') && (
                          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 shadow-sm">
                            <p className="text-gray-600 text-xs font-bold leading-tight">
                              Nenhum alerta crítico disparado. Revisar detalhes para identificar passivos ocultos.
                            </p>
                          </div>
                        )}
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

                                  // 👇 AQUI! Usamos a nossa nova função inteligente do dicionário:
                                  const valorFormatado = formatarResposta(resp.value);

                                  // Lógica de cores: Destaca de vermelho o que é passivo trabalhista
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
                                            href={`${import.meta.env.VITE_API_URL}/ficheiros/${resp.value}`}
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
                                          <span className={`inline-flex font-bold px-2.5 py-1 rounded-md text-xs ${isAlerta ? 'bg-red-50 text-red-700' : 'text-gray-700 bg-gray-100'
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