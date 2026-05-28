import { Link, useLocation, useNavigate } from 'react-router-dom';

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Função para deslogar com segurança
  const handleLogout = () => {
    // Limpa os dados do navegador
    localStorage.removeItem('@Nexum:token');
    localStorage.removeItem('@Nexum:officeId');
    
    // Manda pro login
    navigate('/login');
  };

  // Lista de botões do menu (Fica fácil adicionar mais depois!)
  const links = [
    { name: 'Início', path: '/' },
    { name: 'Configurações', path: '/configuracoes/escritorio' },
  ];

  return (
    <nav className="bg-[#13233d] text-white shadow-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LOGO DO SISTEMA */}
          <div className="flex-shrink-0 font-bold text-2xl tracking-wider text-[#d1d871]">
            NEXUM
          </div>

          {/* LINKS DE NAVEGAÇÃO */}
          <div className="flex items-center gap-2 sm:gap-6">
            {links.map((link) => {
              // Verifica se a pessoa está na página atual para deixar o botão aceso
              const isActive = location.pathname === link.path;
              
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-[#3a4f99] text-white' 
                      : 'text-gray-300 hover:bg-[#3a4f99]/50 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {/* BOTÃO DE SAIR */}
            <button
              onClick={handleLogout}
              className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
            >
              Sair
            </button>
          </div>
          
        </div>
      </div>
    </nav>
  );
}