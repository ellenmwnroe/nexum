import { useState, useEffect } from 'react';
import type React from 'react';
import { apiFetch } from '../services/api'; 

export function ConfiguracoesEscritorio() {
  // 1. States para os textos
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // 2. States exclusivos para a Imagem
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  // Função para carregar os dados atuais quando a tela abre
  useEffect(() => {
    async function carregarDados() {
      try {
        const res = await apiFetch('/api/offices/me');
        if (res.ok) {
          const data = await res.json();
          setName(data.name || '');
          setEmail(data.email || '');
          setPhone(data.phone || '');
          setAddress(data.address || '');
          setLogoPreview(data.logo_url || null); // Mostra a logo que já tá no banco
        }
      } catch (err) {
        console.error("Erro ao carregar escritório:", err);
      }
    }
    carregarDados();
  }, []);

  // Quando o usuário escolhe uma foto nova do PC
  const handleMudarFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file); // Guarda o arquivo físico para enviar pro back-end
      setLogoPreview(URL.createObjectURL(file)); // Cria um link temporário só pro usuário ver a prévia na tela
    }
  };

  // O momento do envio
  const handleSalvar = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // A Mágica do FormData: É como montar um pacote de correio
      const pacoteDeDados = new FormData();
      pacoteDeDados.append('name', name);
      pacoteDeDados.append('email', email);
      pacoteDeDados.append('phone', phone);
      pacoteDeDados.append('address', address);
      
      // Se ele escolheu uma foto nova, coloca no pacote com o nome "logo" (mesmo nome do upload.single('logo') no Back-end!)
      if (logoFile) {
        pacoteDeDados.append('logo', logoFile);
      }

      // Envia usando o apiFetch
      const res = await apiFetch('/api/offices/me', {
        method: 'PATCH',
        body: pacoteDeDados 
        // 🚨 ATENÇÃO: NÃO coloque o cabeçalho 'Content-Type': 'application/json' aqui! 
        // Quando usamos FormData, o navegador calcula o cabeçalho 'multipart/form-data' sozinho.
      });

      if (res.ok) {
        alert('Escritório atualizado com sucesso!');
      } else {
        alert('Falha ao atualizar o escritório.');
      }
    } catch (err) {
      console.error("Erro no submit:", err instanceof Error ? err.message : String(err));
      alert('Erro interno de conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10 mb-24 lg:mb-10">
      <h2 className="text-2xl font-bold text-[#13233d] mb-6">Configurações do Escritório</h2>
      
      <form onSubmit={handleSalvar} className="flex flex-col gap-5">
        
        {/* ÁREA DA LOGO */}
        <div className="flex flex-col items-center gap-3 p-4 border border-gray-200 rounded-xl bg-gray-50">
          {logoPreview ? (
            <img src={logoPreview} alt="Prévia da Logo" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm" />
          ) : (
            <div className="w-24 h-24 bg-[#3a4f99] rounded-full flex items-center justify-center font-bold text-[#d1d871] text-3xl">
              {name.charAt(0).toUpperCase() || 'A'}
            </div>
          )}
          
          <label 
            htmlFor="logo-upload" 
            className="cursor-pointer bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-bold text-[#13233d] hover:bg-gray-100 transition-colors"
          >
            <span>Trocar Logo</span>
            
            <input 
              id="logo-upload" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleMudarFoto} 
            />
          </label>
        </div>

        {/* CAMPOS DE TEXTO */}
        <div className="flex flex-col gap-1">
          {/* Adicionamos o htmlFor="office-name" */}
          <label htmlFor="office-name" className="text-sm font-bold text-gray-700">
            Nome do Escritório
          </label>
          <input 
            id="office-name" 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            className="border p-3 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-[#3a4f99]" 
          />
        </div>

        <div className="flex flex-col gap-1">
          {/* Adicionamos o htmlFor="office-address" */}
          <label htmlFor="office-address" className="text-sm font-bold text-gray-700">
            Endereço Completo
          </label>
          {/* Adicionamos o id="office-address" */}
          <input 
            id="office-address" 
            type="text" 
            value={address} 
            onChange={e => setAddress(e.target.value)} 
            className="border p-3 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-[#3a4f99]" 
          />
        </div>

        {/* CAMPO DE E-MAIL */}
        <div className="flex flex-col gap-1">
          <label htmlFor="office-email" className="text-sm font-bold text-gray-700">
            E-mail de Contato
          </label>
          <input 
            id="office-email" 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="border p-3 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-[#3a4f99]" 
          />
        </div>

        {/* CAMPO DE TELEFONE */}
        <div className="flex flex-col gap-1">
          <label htmlFor="office-phone" className="text-sm font-bold text-gray-700">
            Telefone / WhatsApp
          </label>
          <input 
            id="office-phone" 
            type="text" 
            value={phone} 
            onChange={e => setPhone(e.target.value)} 
            className="border p-3 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-[#3a4f99]" 
          />
        </div>

        <button type="submit" disabled={loading} className="mt-4 bg-[#3a4f99] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#13233d] disabled:opacity-50 transition-colors shadow-md">
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </form>
    </div>
  );
}