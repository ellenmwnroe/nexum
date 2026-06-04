export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  // 1. Puxa o crachá do usuário salvo no navegador
  const token = localStorage.getItem('@Nexum:token');

  // 2. Prepara os cabeçalhos de forma segura para o TypeScript
  const headers = new Headers(options.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // 3. Faz a requisição oficial para o Back-end
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // 🚨 4. O INTERCEPTADOR DE EXPIRAÇÃO
  // Se o servidor avisar que o token venceu ou é inválido:
  if (response.status === 401) {
    console.warn('Sessão expirada. Removendo credenciais e redirecionando...');

    // Apaga o token vencido
    localStorage.removeItem('@Nexum:token');

    // Força o redirecionamento limpando a memória do React
    globalThis.location.href = '/login';

    // Interrompe a execução devolvendo um Erro oficial (Padrão SonarQube)
    throw new Error('Sessão expirada');
  }

  // Se estiver tudo certo, devolve a resposta normalmente para o componente
  return response;
}