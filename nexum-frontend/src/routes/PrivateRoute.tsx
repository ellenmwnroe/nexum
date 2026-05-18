import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Este componente funciona como um "Segurança de Balada"
export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { signed, loading } = useAuth();

  if (loading) {
    // Enquanto o React checa o LocalStorage, mostramos um loading genérico
    return <div className="h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!signed) {
    // Se não estiver logado (sem pulseira VIP), chuta pro Login!
    return <Navigate to="/login" replace />;
  }

  // Se estiver logado, deixa passar
  return <>{children}</>;
}