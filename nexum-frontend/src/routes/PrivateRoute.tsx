import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  readonly children: ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { signed, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#ecece5]">
        <div className="w-10 h-10 border-4 border-[#3a4f99]/20 border-t-[#3a4f99] rounded-full animate-spin mb-4"></div>
        <p className="text-[#13233d] font-bold animate-pulse">Carregando...</p>
      </div>
    );
  }

  if (!signed) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}