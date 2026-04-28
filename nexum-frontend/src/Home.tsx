import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, BarChart3 } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#ecece5] font-sans selection:bg-[#d1d871] selection:text-[#13233d]">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#3a4f99] rounded-lg flex items-center justify-center">
            <span className="text-[#d1d871] font-bold text-xl">N</span>
          </div>
          <span className="text-2xl font-bold text-[#13233d] tracking-tight">NEXUM</span>
        </div>
        <button 
          onClick={() => navigate('/dashboard')}
          className="text-[#3a4f99] font-semibold hover:text-[#13233d] transition-colors"
        >
          Área do Advogado
        </button>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-8 pt-20 pb-32 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#d1d871]/30 text-[#13233d] text-sm font-bold mb-6 tracking-wide uppercase">
            Inteligência Jurídica Trabalhista
          </span>
          <h1 className="text-6xl font-extrabold text-[#13233d] leading-[1.1] mb-8">
            Transforme triagens complexas em <span className="text-[#3a4f99]">decisões estratégicas.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-lg">
            Otimize o atendimento do seu escritório com nossa triagem dinâmica. Identifique riscos de fraude e verbas pendentes antes mesmo da primeira reunião.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => navigate('/triagem')}
              className="px-8 py-4 bg-[#3a4f99] text-white rounded-xl font-bold text-lg hover:bg-[#13233d] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
            >
              Iniciar Nova Triagem <ArrowRight size={20} />
            </button>
            <button className="px-8 py-4 bg-white text-[#13233d] border-2 border-gray-200 rounded-xl font-bold text-lg hover:border-[#3a4f99] transition-all">
              Conhecer a Plataforma
            </button>
          </div>
        </div>

        {/* Card de Visualização (Mockup da Interface) */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-tr from-[#d1d871] to-[#3a4f99] rounded-[2rem] blur-2xl opacity-20 animate-pulse"></div>
          <div className="relative bg-white border border-gray-100 rounded-[2rem] shadow-2xl overflow-hidden p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full animate-pulse"></div>
              <div className="space-y-2">
                <div className="w-32 h-3 bg-gray-200 rounded-full"></div>
                <div className="w-20 h-2 bg-gray-100 rounded-full"></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-[#ecece5] rounded-xl border-l-4 border-[#3a4f99]">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Status do Caso</p>
                <p className="text-[#13233d] font-bold">Análise de Vínculo Empregatício</p>
              </div>
              <div className="p-4 bg-[#d1d871]/10 rounded-xl border-l-4 border-[#d1d871]">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Risco Detectado</p>
                <p className="text-[#13233d] font-bold">Possível Pejotização (Grau: Elevado)</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Rápidas */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-[#ecece5] rounded-xl flex items-center justify-center text-[#3a4f99]">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold text-[#13233d]">Triagem Dinâmica</h3>
            <p className="text-gray-500">Perguntas que se adaptam às respostas do cliente em tempo real.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-[#ecece5] rounded-xl flex items-center justify-center text-[#3a4f99]">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold text-[#13233d]">Segurança de Dados</h3>
            <p className="text-gray-500">Isolamento multi-tenant garantindo que os dados de cada escritório sejam privados.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-[#ecece5] rounded-xl flex items-center justify-center text-[#3a4f99]">
              <BarChart3 size={24} />
            </div>
            <h3 className="text-xl font-bold text-[#13233d]">Dashboard Analítico</h3>
            <p className="text-gray-500">Visualize leads qualificados com scores de risco automáticos.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
