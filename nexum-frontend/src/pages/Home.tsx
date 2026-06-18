import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* NAVBAR */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              {/* ESPAÇO PARA A LOGO OFICIAL */}
              <div className="w-10 h-10 bg-slate-900 rounded flex items-center justify-center text-white font-bold text-xl shadow-sm">
                N
              </div>
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight uppercase">Nexum</span>
            </div>
            <div className="hidden md:flex space-x-10">
              <a href="#solucoes" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Soluções</a>
              <a href="#seguranca" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Segurança</a>
              <a href="#planos" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Planos</a>
            </div>
            <div>
              <Link 
                to="/login" 
                className="bg-slate-900 text-white px-6 py-2.5 rounded text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm"
              >
                Acessar Painel
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="bg-slate-900 text-white pt-24 pb-32 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-8 leading-tight">
            Gestão Jurídica Inteligente para <br className="hidden md:block" />
            <span className="text-blue-400">Escritórios de Alta Performance</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-12 font-light">
            Centralize processos, automatize a triagem de clientes e proteja seus documentos em uma infraestrutura na nuvem de nível militar. O Nexum otimiza a operação para você focar na estratégia legal.
          </p>
          <div className="flex justify-center gap-4">
            <a href="#planos" className="bg-white text-slate-900 px-8 py-3.5 rounded font-bold text-sm hover:bg-slate-100 transition shadow-lg uppercase tracking-wide">
              Consultar Planos
            </a>
            <a href="#contato" className="bg-transparent border border-slate-600 text-white px-8 py-3.5 rounded font-bold text-sm hover:bg-slate-800 transition uppercase tracking-wide">
              Agendar Demonstração
            </a>
          </div>
        </div>
      </section>

      {/* SOLUÇÕES (Features) */}
      <section id="solucoes" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Arquitetura Completa para Advocacia</h2>
            <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">Módulos integrados desenvolvidos especificamente para resolver os gargalos operacionais das bancas jurídicas contemporâneas.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="group">
              <div className="w-14 h-14 bg-slate-100 text-slate-900 rounded flex items-center justify-center mb-6 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Gestão de Processos</h3>
              <p className="text-slate-600 leading-relaxed">
                Painel centralizado para acompanhamento de casos. Defina prioridades, atribua advogados responsáveis e acompanhe o ciclo de vida de cada processo em tempo real.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group">
              <div className="w-14 h-14 bg-slate-100 text-slate-900 rounded flex items-center justify-center mb-6 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Triagem Automatizada</h3>
              <p className="text-slate-600 leading-relaxed">
                Captação inicial inteligente de clientes. Formulários dinâmicos que coletam dados essenciais e geram pré-análises de viabilidade antes do primeiro atendimento.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group">
              <div className="w-14 h-14 bg-slate-100 text-slate-900 rounded flex items-center justify-center mb-6 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Cofre Digital Cloud</h3>
              <p className="text-slate-600 leading-relaxed">
                Armazenamento em nuvem definitivo e seguro. Anexe PDFs, imagens e documentos legais aos processos, eliminando o papel e garantindo redundância de dados.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEGURANÇA E CONFORMIDADE */}
      <section id="seguranca" className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-6">Conformidade e Proteção de Dados (LGPD)</h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                O Nexum foi desenhado com o conceito de <em>Privacy by Design</em>. Entendemos que a confidencialidade é o pilar da relação entre advogado e cliente.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span className="text-slate-700"><strong>Criptografia Avançada:</strong> Senhas e tokens de sessão protegidos com os mais rigorosos algoritmos de hash.</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span className="text-slate-700"><strong>Controle de Acessos:</strong> Perfis de usuário restritos (Administrador vs. Advogado Associado).</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span className="text-slate-700"><strong>Hospedagem Privada:</strong> Infraestrutura isolada em rede privada interna para prevenir acessos externos não autorizados.</span>
                </li>
              </ul>
            </div>
            <div className="md:w-1/2 w-full">
              <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-16 -mt-16 z-0"></div>
                <div className="relative z-10">
                  <svg className="w-12 h-12 text-slate-800 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Auditoria de Segurança</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Nossos servidores passam por análise estática contínua de código, garantindo que não existam vulnerabilidades na aplicação. Seus dados e os dados de seus clientes permanecem estritamente confidenciais.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Investimento em Eficiência</h2>
            <p className="mt-4 text-lg text-slate-500">Planos escaláveis desenvolvidos para acompanhar o crescimento da sua banca.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Plano Individual */}
            <div className="bg-white p-10 rounded text-center border border-slate-200 hover:border-slate-400 transition-colors">
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide">Individual</h3>
              <div className="my-6">
                <span className="text-4xl font-extrabold text-slate-900">R$ 149</span>
                <span className="text-slate-500"> /mês</span>
              </div>
              <p className="text-sm text-slate-500 mb-8 border-b border-slate-100 pb-8">Para advogados autônomos em início de digitalização.</p>
              <ul className="space-y-4 text-sm text-slate-700 text-left mb-8">
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                  1 Acesso Titular
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                  Até 100 processos ativos
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                  5GB Armazenamento Cloud
                </li>
              </ul>
              <button className="w-full bg-slate-100 text-slate-900 font-bold py-3 rounded hover:bg-slate-200 transition text-sm uppercase tracking-wide">Assinar</button>
            </div>

            {/* Plano Corporate */}
            <div className="bg-slate-900 p-10 rounded text-center border-2 border-slate-900 shadow-xl relative transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -mt-4 bg-blue-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                Recomendado
              </div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wide">Banca Jurídica</h3>
              <div className="my-6">
                <span className="text-4xl font-extrabold text-white">R$ 499</span>
                <span className="text-slate-400"> /mês</span>
              </div>
              <p className="text-sm text-slate-400 mb-8 border-b border-slate-700 pb-8">A infraestrutura completa para sociedades e escritórios.</p>
              <ul className="space-y-4 text-sm text-slate-300 text-left mb-8">
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                  Até 10 Advogados
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                  Processos Ilimitados
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                  Fluxo de Triagem Completo
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                  50GB Armazenamento Cloud
                </li>
              </ul>
              <button className="w-full bg-white text-slate-900 font-bold py-3 rounded hover:bg-slate-100 transition text-sm uppercase tracking-wide shadow-sm">Assinar</button>
            </div>

            {/* Plano Enterprise */}
            <div className="bg-white p-10 rounded text-center border border-slate-200 hover:border-slate-400 transition-colors">
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide">Enterprise</h3>
              <div className="my-6">
                <span className="text-4xl font-extrabold text-slate-900">Custom</span>
              </div>
              <p className="text-sm text-slate-500 mb-8 border-b border-slate-100 pb-8">Operações de grande escala com demandas exclusivas.</p>
              <ul className="space-y-4 text-sm text-slate-700 text-left mb-8">
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                  Usuários Ilimitados
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                  Servidor Cloud Dedicado
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                  Suporte Técnico 24/7
                </li>
              </ul>
              <button className="w-full bg-transparent border-2 border-slate-900 text-slate-900 font-bold py-2.5 rounded hover:bg-slate-50 transition text-sm uppercase tracking-wide">Contatar Vendas</button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center text-white font-bold text-sm">
                N
              </div>
              <span className="text-xl font-bold text-white tracking-tight uppercase">Nexum</span>
            </div>
            <p className="text-sm leading-relaxed max-w-sm mb-6">
              Software em nuvem para gestão jurídica de alta performance. Construído com arquitetura moderna para modernizar o mercado do Direito.
            </p>
            <p className="text-sm">São Luís - MA, Brasil</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Plataforma</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#solucoes" className="hover:text-white transition">Funcionalidades</a></li>
              <li><a href="#planos" className="hover:text-white transition">Planos e Preços</a></li>
              <li><a href="#seguranca" className="hover:text-white transition">Segurança de Dados</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Contato</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="mailto:contato@nexum.com.br" className="hover:text-white transition">contato@nexum.com.br</a></li>
              <li><Link to="/login" className="hover:text-white transition">Login Comercial</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-sm text-center md:text-left flex flex-col md:flex-row justify-between">
          <p>© 2026 Nexum Tecnologia Jurídica. Todos os direitos reservados.</p>
          <div className="mt-4 md:mt-0 space-x-6">
            <Link to="/termos" className="hover:text-white transition">Termos de Serviço</Link>
            <Link to="/privacidade" className="hover:text-white transition">Política de Privacidade</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}