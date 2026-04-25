import { useState, useRef, useEffect } from 'react';
import type React from 'react';

interface Mensagem {
  id: number;
  remetente: 'bot' | 'user';
  texto: string;
}

function Triagem() {
  const [chatLog, setChatLog] = useState<Mensagem[]>([
    { id: 1, remetente: 'bot', texto: 'Olá! Sou o assistente virtual do escritório. Seus dados estão protegidos por criptografia e total sigilo jurídico. Você concorda com a nossa política de privacidade (LGPD)?' }
  ]);

  const [passoAtual, setPassoAtual] = useState<string>('lgpd');
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [inputValue, setInputValue] = useState('');
  const chatFimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatFimRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  const lidarComResposta = (valorParaBanco: string, textoParaChat: string) => {
    let textoExibido = textoParaChat;
    if (passoAtual === 'data_admissao' || passoAtual === 'data_demissao') {
        const partes = valorParaBanco.split('-');
        if (partes.length === 3) textoExibido = `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    setChatLog(prev => [...prev, { id: Date.now(), remetente: 'user', texto: textoExibido }]);
    
    const novasRespostas = { ...respostas, [passoAtual]: valorParaBanco };
    setRespostas(novasRespostas);
    setInputValue('');

    setTimeout(() => {
      if (passoAtual === 'lgpd') {
        if (valorParaBanco === 'nao') {
          setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Compreendo. Sem o seu consentimento, o atendimento foi encerrado por segurança.' }]);
          setPassoAtual('fim');
        } else {
          setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Excelente! Para o advogado conhecer você, como se chama?' }]);
          setPassoAtual('nome');
        }
      }
      else if (passoAtual === 'nome') {
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: `Muito prazer, ${textoParaChat}! Qual é o nome da empresa onde ocorreu o problema?` }]);
        setPassoAtual('empresa');
      }
      else if (passoAtual === 'empresa') {
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Certo. Qual foi a data aproximada em que você começou a trabalhar lá?' }]);
        setPassoAtual('data_admissao');
      }
      else if (passoAtual === 'data_admissao') {
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'E qual foi o seu último dia (data de saída)?' }]);
        setPassoAtual('data_demissao');
      }
      else if (passoAtual === 'data_demissao') {
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Anotado. Qual era o valor do seu último salário mensal? (Apenas números)' }]);
        setPassoAtual('salario');
      }
      else if (passoAtual === 'salario') {
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Perfeito. Uma dúvida que muda tudo: você trabalhava (ou trabalha) com a carteira assinada nessa empresa?' }]);
        setPassoAtual('carteira_assinada');
      }
      else if (passoAtual === 'carteira_assinada') {
        if (valorParaBanco === 'nao') {
          setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Entendi. Eles te obrigaram a abrir um CNPJ (MEI) ou assinar algum contrato de prestação de serviços?' }]);
          setPassoAtual('pejotizacao');
        } else {
          setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Compreendido. E qual é a sua situação atual com a empresa?' }]);
          setPassoAtual('situacao');
        }
      }
      else if (passoAtual === 'pejotizacao') {
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Mesmo sem carteira, você tinha horário fixo e recebia ordens diretas de um chefe?' }]);
        setPassoAtual('subordinacao');
      }
      else if (passoAtual === 'subordinacao') {
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Para o advogado reconhecer seu vínculo, precisamos de provas. Você possui mensagens de WhatsApp que provem as ordens?' }]);
        setPassoAtual('provas');
      }
      else if (passoAtual === 'provas') {
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Isso fortalece muito o caso! Deseja relatar mais algum detalhe específico (humilhações, descontos)?' }]);
        setPassoAtual('observacoes');
      }
      else if (passoAtual === 'situacao') {
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Certo. Você recebia alguma parte do seu salário "por fora"?' }]);
        setPassoAtual('salario_por_fora');
      }
      else if (passoAtual === 'salario_por_fora') {
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Anotado. Você trabalhava com barulho forte, produtos químicos, ou adquiriu alguma doença no trabalho?' }]);
        setPassoAtual('condicoes_trabalho');
      }
      else if (passoAtual === 'condicoes_trabalho') {
        if (novasRespostas['situacao'] === 'ainda_trabalhando') {
          setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Como você ainda está lá: você costuma fazer horas extras? Elas são pagas?' }]);
          setPassoAtual('horas_extras');
        } else {
          setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Como você já saiu, a empresa depositou seu FGTS corretamente e pagou a rescisão?' }]);
          setPassoAtual('fgts_rescisao');
        }
      }
      else if (passoAtual === 'fgts_rescisao' || passoAtual === 'horas_extras') {
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'O principal já temos! Deseja relatar mais algum detalhe (assédio, promessas não cumpridas)?' }]);
        setPassoAtual('observacoes');
      }
      else if (passoAtual === 'observacoes') {
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Muito obrigado! Sua triagem foi enviada com sucesso para análise.' }]);
        setPassoAtual('fim');
        console.log('✅ JSON PRONTO PARA API:', novasRespostas);
      }
    }, 800);
  };

  const enviarTexto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    lidarComResposta(inputValue, inputValue);
  };

  return (
    // Fundo Eggshell
    <div className="min-h-screen bg-[#ecece5] flex items-center justify-center p-2 sm:p-6 font-sans">
      
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh] sm:h-[85vh] border border-gray-200">
        
        {/* CABEÇALHO - Denim */}
        <div className="bg-[#13233d] text-white p-4 sm:p-5 flex justify-between items-center z-10 shadow-md relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-[#13233d] text-lg shadow-inner overflow-hidden border-2 border-[#b2cee2]">
              ADV
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-none tracking-wide">Escritório Parceiro</span>
              <span className="text-[10px] text-[#b2cee2] font-bold tracking-widest uppercase mt-1">
                Powered by Nexum
              </span>
            </div>
          </div>

          {/* Selo Seguro - Key Lime */}
          <div className="bg-[#d1d871] text-[#13233d] text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
            {/* SVG Blindado com tamanho fixo direto no HTML */}
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
            Ambiente Seguro
          </div>
        </div>

        {/* MENSAGENS */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto flex flex-col gap-5 bg-gray-50/50">
          {chatLog.map((msg) => (
            <div 
              key={msg.id} 
              className={`max-w-[85%] sm:max-w-[80%] p-4 text-[15px] leading-relaxed shadow-sm ${
                msg.remetente === 'user' 
                  ? 'self-end bg-[#6299d0] text-white rounded-[20px] rounded-br-[4px]' // User = Olympic
                  : 'self-start bg-white text-[#13233d] border border-gray-200 rounded-[20px] rounded-bl-[4px]' // Bot = Branco + Texto Denim
              }`}
            >
              {msg.texto}
            </div>
          ))}
          <div ref={chatFimRef} />
        </div>

        {/* RODAPÉ */}
        <div className="bg-white border-t border-gray-100 p-4 sm:p-5 shadow-[0_-4px_20px_-15px_rgba(0,0,0,0.1)]">
          
          {['nome', 'empresa', 'salario', 'observacoes'].includes(passoAtual) && (
            <form onSubmit={enviarTexto} className="flex gap-2">
              <input 
                type={passoAtual === 'salario' ? 'number' : 'text'} 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escreva sua resposta..." 
                className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6299d0] transition-all text-[#13233d]"
                autoFocus
              />
              <button type="submit" className="px-6 py-4 rounded-2xl font-bold text-white transition-all bg-[#3a4f99] hover:bg-[#13233d] active:scale-95 flex items-center justify-center">
                <svg width="20" height="20" className="transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              </button>
            </form>
          )}

          {['data_admissao', 'data_demissao'].includes(passoAtual) && (
            <form onSubmit={enviarTexto} className="flex gap-2">
              <input 
                type="date" 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6299d0] text-[#13233d]"
                autoFocus
              />
              <button type="submit" className="px-6 py-4 rounded-2xl font-bold text-white transition-all bg-[#3a4f99] hover:bg-[#13233d] active:scale-95 whitespace-nowrap">
                Confirmar
              </button>
            </form>
          )}

          {passoAtual === 'lgpd' && (
            <div className="flex flex-col gap-3">
              <button onClick={() => lidarComResposta('sim', 'Sim, eu concordo')} className="w-full p-4 bg-[#13233d] text-[#d1d871] rounded-2xl font-bold transition-transform active:scale-[0.98] shadow-lg flex justify-center items-center">
                Sim, aceito iniciar de forma segura
              </button>
              <button onClick={() => lidarComResposta('nao', 'Não concordo')} className="w-full p-2 text-gray-400 hover:text-gray-600 font-medium transition-colors">
                Não concordo
              </button>
            </div>
          )}

          {(['carteira_assinada', 'salario_por_fora', 'condicoes_trabalho', 'pejotizacao', 'subordinacao', 'provas'].includes(passoAtual)) && (
            <div className="flex gap-3">
              <button onClick={() => lidarComResposta('sim', 'Sim')} className="flex-1 p-4 bg-[#b2cee2]/20 text-[#3a4f99] hover:bg-[#b2cee2]/40 border border-[#b2cee2] rounded-2xl font-bold transition-colors active:scale-95">Sim</button>
              <button onClick={() => lidarComResposta('nao', 'Não')} className="flex-1 p-4 bg-white text-gray-500 hover:bg-gray-50 border border-gray-200 rounded-2xl font-bold transition-colors active:scale-95">Não</button>
            </div>
          )}

          {passoAtual === 'situacao' && (
            <div className="flex flex-col gap-2.5">
              <button onClick={() => lidarComResposta('demitido_sem_justa', 'Fui demitido sem justa causa')} className="btn-nexum-lista">Fui demitido sem justa causa</button>
              <button onClick={() => lidarComResposta('pedido_demissao', 'Eu pedi demissão')} className="btn-nexum-lista">Eu pedi demissão</button>
              <button onClick={() => lidarComResposta('demitido_justa_causa', 'Fui demitido por justa causa')} className="btn-nexum-lista">Fui demitido por justa causa</button>
              <button onClick={() => lidarComResposta('ainda_trabalhando', 'Ainda estou trabalhando lá')} className="btn-nexum-lista border-[#b2cee2] bg-[#b2cee2]/10 text-[#3a4f99]">Ainda estou trabalhando lá</button>
            </div>
          )}

          {passoAtual === 'fgts_rescisao' && (
            <div className="flex flex-col gap-2.5">
              <button onClick={() => lidarComResposta('pagou_tudo', 'Pagou tudo certinho')} className="btn-nexum-lista">Pagou tudo certinho</button>
              <button onClick={() => lidarComResposta('nao_pagou_fgts', 'Não depositou o FGTS')} className="btn-nexum-lista border-red-200 text-red-600">Não depositou o FGTS</button>
              <button onClick={() => lidarComResposta('nao_pagou_nada', 'Não pagou FGTS nem rescisão')} className="btn-nexum-lista border-red-200 text-red-600">Não pagou FGTS nem rescisão</button>
            </div>
          )}

          {passoAtual === 'horas_extras' && (
            <div className="flex flex-col gap-2.5">
              <button onClick={() => lidarComResposta('faz_e_recebe', 'Faço e recebo certinho')} className="btn-nexum-lista">Faço e recebo certinho</button>
              <button onClick={() => lidarComResposta('faz_mas_nao_recebe', 'Faço mas não recebo')} className="btn-nexum-lista border-orange-200 text-orange-600">Faço mas não recebo</button>
              <button onClick={() => lidarComResposta('nao_faz', 'Não faço horas extras')} className="btn-nexum-lista">Não faço horas extras</button>
            </div>
          )}

          {passoAtual === 'fim' && (
            <div className="text-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-sm text-[#3a4f99] font-bold">Atendimento criptografado e salvo.</p>
            </div>
          )}

        </div>
      </div>

      <style>{`
        .btn-nexum-lista {
          width: 100%;
          padding: 16px;
          background-color: white;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          text-align: left;
          font-weight: 600;
          color: #13233d;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }
        .btn-nexum-lista:hover {
          background-color: #f9fafb;
          border-color: #6299d0;
          transform: translateY(-1px);
        }
        .btn-nexum-lista:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
}

export default Triagem;