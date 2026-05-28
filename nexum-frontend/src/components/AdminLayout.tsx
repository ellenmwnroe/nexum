import type { ReactNode } from 'react';
import { Navbar } from './Navbar';

interface AdminLayoutProps {
  readonly children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* O Menu Superior fica fixo aqui */}
      <Navbar />
      
      {/* O conteúdo da página aparece aqui no meio */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}