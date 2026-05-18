import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom'; // 

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard'); 
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-[#ecece5] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-[#13233d] tracking-tighter">NEXUM</h1>
          <p className="text-gray-400 font-medium mt-2">Painel Administrativo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">E-mail Corporativo</label>
            <input 
              type="email" 
              required
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#3a4f99] focus:bg-white outline-none transition-all"
              placeholder="exemplo@nexum.com.br"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Senha</label>
            <input 
              type="password" 
              required
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#3a4f99] focus:bg-white outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-[#13233d] hover:bg-[#3a4f99] text-white font-bold py-4 rounded-2xl shadow-lg transition-colors transform active:scale-[0.98]"
          >
            Acessar Sistema
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-8">
          &copy; 2026 Nexum Tecnologia Jurídica.
        </p>
      </div>
    </div>
  );
}