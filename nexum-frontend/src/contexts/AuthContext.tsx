import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';

// Tipagem para o Typescript não reclamar
interface AuthContextData {
  signed: boolean;
  lawyer: any | null;
  login(email: string, pass: string): Promise<void>;
  logout(): void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [lawyer, setLawyer] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca os dados salvos no navegador ao iniciar
    const storagedUser = localStorage.getItem('@Nexum:user');
    const storagedToken = localStorage.getItem('@Nexum:token');

    if (storagedUser && storagedToken) {
      setLawyer(JSON.parse(storagedUser));
      // Aqui você poderia configurar o cabeçalho padrão do Axios com o token
    }
    setLoading(false);
  }, []);

  async function login(email: string, pass: string) {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });

    const data = await response.json();

    if (response.ok) {
      setLawyer(data.lawyer);
      localStorage.setItem('@Nexum:user', JSON.stringify(data.lawyer));
      localStorage.setItem('@Nexum:token', data.token);
    } else {
      throw new Error(data.error || 'Erro ao logar');
    }
  }

  function logout() {
    localStorage.removeItem('@Nexum:user');
    localStorage.removeItem('@Nexum:token');
    setLawyer(null);
  }

  return (
    <AuthContext.Provider value={{ signed: !!lawyer, lawyer, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para facilitar o uso nas telas
export function useAuth() {
  return useContext(AuthContext);
}