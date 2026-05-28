import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserData {
  name: string;
  email: string;
  phone: string;
  avatar_url: string;
}

export default function Configuracoes() {
  const [user, setUser] = useState<UserData>({ name: '', email: '', phone: '', avatar_url: '' });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const navigate = useNavigate();

  const token = localStorage.getItem('@Nexum:token');

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('http://localhost:3000/api/lawyers/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            avatar_url: data.avatar_url || ''
          });
        }
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [token]);

  async function handleSaveUser(e: React.SyntheticEvent) {
    e.preventDefault();
    setMensagem({ tipo: '', texto: '' });

    const formData = new FormData();
    formData.append('name', user.name);
    formData.append('email', user.email);
    formData.append('phone', user.phone);
    
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    try {
      const res = await fetch('http://localhost:3000/api/lawyers/me', {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
        body: formData
      });

      if (res.ok) {
        const resultado = await res.json();
        setMensagem({ tipo: 'sucesso', texto: 'Seu perfil foi atualizado com sucesso!' });
        setUser(prev => ({ ...prev, avatar_url: resultado.lawyer.avatar_url }));
        setAvatarFile(null);
      } else {
        setMensagem({ tipo: 'erro', texto: 'Erro ao salvar os dados do perfil.' });
      }
    } catch (err) {
      console.error("Erro ao salvar perfil:", err);
      setMensagem({ tipo: 'erro', texto: 'Erro de conexão com o servidor.' });
    }
  }

  if (loading) return <div className="p-8 text-center font-bold text-gray-500">Carregando perfil...</div>;

  return (
    <div className="min-h-screen bg-[#ecece5] p-4 md:p-8 font-sans">
      <div className="max-w-2xl mx-auto">
        
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 bg-white hover:bg-gray-100 text-gray-600 rounded-full transition-colors shadow-sm"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <h1 className="text-2xl font-black text-[#13233d]">Configurações do Perfil</h1>
        </div>

        {mensagem.texto && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-semibold shadow-sm ${mensagem.tipo === 'sucesso' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
            {mensagem.texto}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <form onSubmit={handleSaveUser} className="space-y-6">
            
            <div>
              <label htmlFor="avatar-upload" className="block text-sm font-bold text-gray-700 mb-2">Foto de Perfil</label>
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                
                <img 
                  src={avatarPreview || user.avatar_url || 'https://via.placeholder.com/150'} 
                  alt="Avatar" 
                  className="w-20 h-20 rounded-full object-cover border-2 border-[#13233d]/20 bg-white shadow-sm shrink-0" 
                />
                
                <input 
                  id="avatar-upload"
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setAvatarFile(file);
                      setAvatarPreview(URL.createObjectURL(file)); 
                    }
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-[#3a4f99]/10 file:text-[#3a4f99] hover:file:bg-[#3a4f99]/20 transition-all cursor-pointer" 
                />
              </div>
            </div>

            <div>
              <label htmlFor="user-name" className="block text-sm font-bold text-gray-700 mb-1">Nome Completo</label>
              <input 
                id="user-name"
                type="text" 
                value={user.name} 
                onChange={e => setUser({...user, name: e.target.value})} 
                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#3a4f99] outline-none transition-all font-medium text-gray-800" 
                required 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="user-email" className="block text-sm font-bold text-gray-700 mb-1">E-mail de Login</label>
                <input 
                  id="user-email"
                  type="email" 
                  value={user.email} 
                  onChange={e => setUser({...user, email: e.target.value})} 
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#3a4f99] outline-none transition-all text-gray-600 bg-gray-50" 
                  required 
                />
              </div>
              <div>
                <label htmlFor="user-phone" className="block text-sm font-bold text-gray-700 mb-1">Celular / WhatsApp</label>
                <input 
                  id="user-phone"
                  type="text" 
                  value={user.phone} 
                  onChange={e => setUser({...user, phone: e.target.value})} 
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#3a4f99] outline-none transition-all font-medium text-gray-800" 
                  placeholder="(98) 98844-2519" 
                />
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 flex justify-end">
              <button 
                type="submit" 
                className="w-full sm:w-auto px-6 py-3 bg-[#3a4f99] hover:bg-[#13233d] text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
              >
                Salvar Alterações do Perfil
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}