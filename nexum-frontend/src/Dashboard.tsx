import { useEffect, useState } from 'react';
import { 
  User, Briefcase, Calendar, 
  ChevronDown, ChevronUp, FileText, AlertTriangle 
} from 'lucide-react';

interface CaseItem {
  id: string;
  user?: { name: string; cpf: string };
  company?: string;
  role?: string;
  salary?: number;
  admission_date?: string;
  resignation_date?: string;
  status: string;
  triage_responses?: { field_name: string; value: string }[];
}

function Dashboard() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:3000/api/cases')
      .then(res => res.json())
      .then(payload => {
        // Garantimos que payload.data seja sempre um array
        setCases(Array.isArray(payload.data) ? payload.data : Array.isArray(payload) ? payload : []);
      })
      .catch(err => console.error("Erro ao buscar casos:", err));
  }, []);

  const formatCurrency = (value?: number) => {
    if (!value) return "Não informado";
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "--/--/----";
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-[#ecece5] p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-[#13233d] mb-2 tracking-tight">Nexum Dashboard</h1>
          <p className="text-gray-500 font-medium italic">Análise de leads e triagens em tempo real.</p>
        </header>

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
                            {formatDate(c.admission_date)} — {formatDate(c.resignation_date)}
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

                      {/* Coluna 3: Alerta de Risco */}
                      <div className="space-y-3">
                        <h4 className="text-[#3a4f99] font-bold text-sm flex items-center gap-2 text-orange-600">
                          <AlertTriangle size={16} /> Insight Nexum
                        </h4>
                        <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                          <p className="text-orange-800 text-xs font-bold leading-tight">
                            Revisar detalhes do vínculo para identificar passivos trabalhistas.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Respostas da Triagem */}
                    <div className="space-y-3">
                      <h4 className="text-[#13233d] font-bold text-sm flex items-center gap-2">
                        <FileText size={16} /> Questionário de Triagem
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {c.triage_responses && c.triage_responses.length > 0 ? (
                          c.triage_responses.map((resp, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                              <span className="text-xs text-gray-500 font-medium">{resp.field_name}</span>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                resp.value === 'Sim' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                              }`}>
                                {resp.value}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-2 text-sm text-gray-400 italic p-2">
                            Nenhuma resposta dinâmica vinculada a este caso.
                          </div>
                        )}
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