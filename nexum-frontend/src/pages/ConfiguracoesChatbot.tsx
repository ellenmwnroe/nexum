import { useState, useEffect } from 'react';
import type React from 'react';
import { apiFetch } from '../services/api';

export function ConfiguracoesChatbot() {
  // States para os textos e cor
  const [botName, setBotName] = useState('');
  const [botWelcome, setBotWelcome] = useState('');
  const [botPrivacy, setBotPrivacy] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#3a4f99'); // Cor padrão do Nexum

  // States para o Avatar
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  // Carrega os dados atuais quando a tela abre
  useEffect(() => {
    async function carregarDados() {
      try {
        // Puxa os dados gerais do escritório logado
        const res = await apiFetch('/api/offices/me');
        if (res.ok) {
          const data = await res.json();
          setBotName(data.bot_name || '');
          setBotWelcome(data.bot_welcome_message || '');
          setBotPrivacy(data.bot_privacy_message || '');
          setPrimaryColor(data.primary_color || '#3a4f99');
          setAvatarPreview(data.bot_avatar_url || data.logo_url || null); 
        }
      } catch (err) {
        console.error("Erro ao carregar configurações do chatbot:", err);
      }
    }
    carregarDados();
  }, []);

  // Preview da nova foto do bot
  const handleMudarFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Envio dos dados
  const handleSalvar = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const pacoteDeDados = new FormData();
      pacoteDeDados.append('bot_name', botName);
      pacoteDeDados.append('bot_welcome_message', botWelcome);
      pacoteDeDados.append('bot_privacy_message', botPrivacy);
      pacoteDeDados.append('primary_color', primaryColor);
      
      // 🚨 Atenção: o nome aqui TEM que ser igual ao upload.single('bot_avatar') do Back-end
      if (avatarFile) {
        pacoteDeDados.append('bot_avatar', avatarFile);
      }

      // Envia para a nova rota que criamos no Back-end
      const res = await apiFetch('/api/offices/me/chatbot-config', {
        method: 'PATCH',
        body: pacoteDeDados 
      });

      if (res.ok) {
        alert('Identidade do Chatbot atualizada com sucesso!');
      } else {
        alert('Falha ao atualizar o Chatbot.');
      }
    } catch (err) {
      console.error("Erro no submit:", err instanceof Error ? err.message : String(err));
      alert('Erro interno de conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // O mb-24 garante que o botão de salvar não suma no celular!
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10 mb-24 lg:mb-10">
      <h2 className="text-2xl font-bold text-[#13233d] mb-6">Identidade do Assistente Virtual</h2>
      
      <form onSubmit={handleSalvar} className="flex flex-col gap-5">
        
        {/* ÁREA DA FOTO DO BOT */}
        <div className="flex flex-col items-center gap-3 p-4 border border-gray-200 rounded-xl bg-gray-50">
          {avatarPreview ? (
            <img src={avatarPreview} alt="Prévia do Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm" />
          ) : (
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center font-bold text-white text-3xl"
              style={{ backgroundColor: primaryColor }} // Usa a cor escolhida como fundo padrão!
            >
              🤖
            </div>
          )}
          
          <label 
            htmlFor="bot-avatar-upload"
            className="cursor-pointer bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-bold text-[#13233d] hover:bg-gray-100 transition-colors"
          >
            <span>Trocar Rosto do Assistente</span>
            <input id="bot-avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleMudarFoto} />
          </label>
        </div>

        {/* NOME DO BOT */}
        <div className="flex flex-col gap-1">
          <label htmlFor="bot-name" className="text-sm font-bold text-gray-700">
            <span>Nome do Assistente</span>
          </label>
          <input 
            id="bot-name" 
            type="text" 
            placeholder="Ex: Assistente Karyne"
            value={botName} 
            onChange={e => setBotName(e.target.value)} 
            className="border p-3 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-[#3a4f99]" 
          />
        </div>

        {/* COR PRINCIPAL (COLOR PICKER) */}
        <div className="flex flex-col gap-1">
          <label htmlFor="primary-color" className="text-sm font-bold text-gray-700">
            <span>Cor Principal do Chatbot</span>
          </label>
          <div className="flex items-center gap-3">
            <input 
              id="primary-color" 
              type="color" 
              value={primaryColor} 
              onChange={e => setPrimaryColor(e.target.value)} 
              className="w-12 h-12 rounded cursor-pointer border-0 p-0" 
            />
            <span className="text-sm text-gray-500 font-mono uppercase">{primaryColor}</span>
          </div>
        </div>

        {/* MENSAGEM INICIAL (TEXTAREA) */}
        <div className="flex flex-col gap-1">
          <label htmlFor="bot-welcome" className="text-sm font-bold text-gray-700">
            <span>Mensagem de Boas-Vindas</span>
          </label>
          <textarea 
            id="bot-welcome" 
            rows={3}
            placeholder="Ex: Olá! Sou o assistente virtual do escritório..."
            value={botWelcome} 
            onChange={e => setBotWelcome(e.target.value)} 
            className="border p-3 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-[#3a4f99] resize-none" 
          />
        </div>

        {/* MENSAGEM DE PRIVACIDADE (TEXTAREA) */}
        <div className="flex flex-col gap-1">
          <label htmlFor="bot-privacy" className="text-sm font-bold text-gray-700">
            <span>Mensagem de Privacidade (LGPD)</span>
          </label>
          <textarea 
            id="bot-privacy" 
            rows={2}
            placeholder="Ex: Seus dados estão seguros conosco e seguem as normas da LGPD."
            value={botPrivacy} 
            onChange={e => setBotPrivacy(e.target.value)} 
            className="border p-3 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-[#3a4f99] resize-none" 
          />
        </div>

        <button type="submit" disabled={loading} className="mt-4 bg-[#3a4f99] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#13233d] disabled:opacity-50 transition-colors shadow-md">
          {loading ? 'Salvando...' : 'Salvar Identidade'}
        </button>
      </form>
    </div>
  );
}