import { useState, useRef, useEffect } from 'react';
import type React from 'react';

interface Mensagem {
  id: number;
  remetente: 'bot' | 'user';
  texto: string;
}

// 🛠️ MÁSCARAS DE FORMATAÇÃO
const mascaraCPF = (valor: string) => {
  return valor.replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1'); 
};

const mascaraCEP = (valor: string) => {
  return valor.replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1'); 
};

const mascaraTelefone = (valor: string) => {
  return valor.replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{4,5})(\d{4})/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
};

const mascaraMoeda = (valor: string) => {
  const apenasNumeros = valor.replace(/\D/g, '');
  const valorFormatado = (Number(apenasNumeros) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  return valorFormatado === 'R$ 0,00' ? '' : valorFormatado;
};

// Nova Máscara de RG Inteligente (Bloqueia caracteres especiais e formata se for só número)
const mascaraRG = (valor: string) => {
  let v = valor.toUpperCase().replace(/[^A-Z0-9]/g, ''); // Permite apenas Letras e Números
  
  // Se for majoritariamente números (ex: 123456789), aplica a máscara visual
  if (/^\d+[X]?$/.test(v) && v.length <= 9) {
    v = v.replace(/(\d{2})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})([A-Z0-9])$/, '$1-$2');
  }
  return v.substring(0, 14); // Limite de segurança de caracteres
};

function Triagem() {
  const [chatLog, setChatLog] = useState<Mensagem[]>([
    { id: 1, remetente: 'bot', texto: 'Olá! Sou o assistente virtual do escritório. Seus dados estão protegidos por criptografia e total sigilo jurídico. Você concorda com a nossa política de privacidade (LGPD)?' }
  ]);
  const [passoAtual, setPassoAtual] = useState<string>('lgpd');
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [inputValue, setInputValue] = useState('');
  const chatFimRef = useRef<HTMLDivElement>(null);

  useEffect(() => chatFimRef.current?.scrollIntoView({ behavior: 'smooth' }), [chatLog]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (passoAtual === 'cpf') val = mascaraCPF(val);
    else if (passoAtual === 'cep') val = mascaraCEP(val);
    else if (passoAtual === 'telefone') val = mascaraTelefone(val);
    else if (passoAtual === 'salario') val = mascaraMoeda(val);
    else if (passoAtual === 'rg') val = mascaraRG(val);
    setInputValue(val);
  };

  const lidarComResposta = (valorParaBanco: string, textoParaChat: string) => {
    let textoExibido = textoParaChat;
    if (['data_admissao', 'data_demissao'].includes(passoAtual)) {
        const partes = valorParaBanco.split('-');
        if (partes.length === 3) textoExibido = `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    setChatLog(prev => [...prev, { id: Date.now(), remetente: 'user', texto: textoExibido }]);
    
  const novasRespostas = { ...respostas, [passoAtual]: valorParaBanco };
    setRespostas(novasRespostas);

    setInputValue('');

    // Árvore de Decisão
    setTimeout(async () => {
      if (passoAtual === 'lgpd') {
        if (valorParaBanco === 'nao') {
          setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Compreendo. Atendimento encerrado por segurança.' }]);
          setPassoAtual('fim');
        } else {
          setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Excelente! Qual é o seu nome completo?' }]);
          setPassoAtual('nome');
        }
      }
      else if (passoAtual === 'nome') {
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: `Muito prazer! Qual é o seu número de WhatsApp com DDD para entrarmos em contato?` }]);
        setPassoAtual('telefone');
      }
      else if (passoAtual === 'telefone') {
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Anotado. E qual é o seu melhor e-mail?' }]);
        setPassoAtual('email');
      }
      else if (passoAtual === 'email') {
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Ótimo! Para sua ficha oficial, digite apenas o seu CPF:' }]);
        setPassoAtual('cpf');
      }
      else if (passoAtual === 'cpf') {
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Certo. Agora digite o número do seu RG:' }]);
        setPassoAtual('rg');
      }
      else if (passoAtual === 'rg') {
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Perfeito. Qual é o CEP da sua residência atual?' }]);
        setPassoAtual('cep');
      }
      else if (passoAtual === 'cep') {
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Confirme o restante do seu endereço (Rua, Número, Bairro, Complemento):' }]);
        setPassoAtual('endereco_compl');
      }
      else if (passoAtual === 'endereco_compl') {
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Tudo certo com seus dados! Qual é o nome da empresa onde ocorreu o problema?' }]);
        setPassoAtual('empresa');
      }
      else if (passoAtual === 'empresa') {
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'E qual era a sua Função ou Cargo lá?' }]);
        setPassoAtual('funcao');
      }
      else if (passoAtual === 'funcao') {
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Qual foi a data aproximada em que você começou a trabalhar lá?' }]);
        setPassoAtual('data_admissao');
      }
      else if (passoAtual === 'data_admissao') {
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'E qual foi o seu último dia (data de saída)?' }]);
        setPassoAtual('data_demissao');
      }
      else if (passoAtual === 'data_demissao') {
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Qual era o valor do seu último salário mensal?' }]);
        setPassoAtual('salario');
      }
      else if (passoAtual === 'salario') {
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Você trabalhava com a carteira assinada nessa empresa?' }]);
        setPassoAtual('carteira_assinada');
      }
      else if (passoAtual === 'carteira_assinada') {
        if (valorParaBanco === 'nao') {
          setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Entendi. Eles te obrigaram a abrir um CNPJ (MEI) ou assinar contrato de prestação de serviços?' }]);
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
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Isso é subordinação! Para pedir seus direitos, qual é a sua situação atual lá?' }]);
        setPassoAtual('situacao'); 
      }
      else if (passoAtual === 'situacao') {
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Certo. Você recebia alguma parte do seu salário "por fora"?' }]);
        setPassoAtual('salario_por_fora');
      }
      else if (passoAtual === 'salario_por_fora') {
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Você trabalhava com barulho forte, produtos químicos, ou adquiriu doença no trabalho?' }]);
        setPassoAtual('condicoes_trabalho');
      }
      else if (passoAtual === 'condicoes_trabalho') {
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Sobre sua jornada: você costumava fazer horas extras ou trabalhar de madrugada? Eram pagas?' }]);
        setPassoAtual('horas_extras');
      }
      else if (passoAtual === 'horas_extras') {
        if (novasRespostas['situacao'] !== 'ainda_trabalhando') {
          setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'A empresa depositou seu FGTS corretamente e pagou suas verbas de rescisão?' }]);
          setPassoAtual('fgts_rescisao');
        } else {
          setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'A empresa deixou de pagar suas Férias ou o seu 13º salário em algum ano?' }]);
          setPassoAtual('verbas_pendentes');
        }
      }
      else if (passoAtual === 'fgts_rescisao') {
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'A empresa deixou de pagar suas Férias ou o seu 13º salário em algum ano?' }]);
        setPassoAtual('verbas_pendentes');
      }
      else if (passoAtual === 'verbas_pendentes') {
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'O principal já temos! Se tiver o Extrato do FGTS em PDF ou prints de WhatsApp, pode anexar agora.' }]);
        setPassoAtual('upload_docs');
      }
      else if (passoAtual === 'upload_docs') {
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Tudo salvo! Deseja relatar mais algum detalhe específico (humilhações, etc)?' }]);
        setPassoAtual('observacoes');
      }
      else if (passoAtual === 'observacoes') {
        // 1. Damos um feedback visual para o utilizador não achar que travou
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'A encriptar e a guardar os seus dados. Um momento, por favor...' }]);
        
        try {
          // 2. Preparamos o objeto final. O 'office_id' pode vir da URL no futuro.
          const payloadDaTriagem = {
            ...novasRespostas,
            office_id: "escritorio-teste" // Usamos o mesmo que configurou no back-end
          };

          // 3. Chamamos a sua API (ajuste a porta 3000 se o seu Node estiver noutra)
          const respostaApi = await fetch('http://localhost:3000/api/triagem', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payloadDaTriagem)
          });

          if (!respostaApi.ok) {
            throw new Error('Falha ao comunicar com o servidor');
          }

          // 4. Se deu tudo certo no Prisma, mostramos a mensagem de sucesso!
          setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Muito obrigado! A sua ficha foi gerada com sucesso e enviada ao advogado de forma segura.' }]);
          setPassoAtual('fim');

        } catch (erro) {
          console.error(erro);
          setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Houve um problema de ligação. A equipa técnica já foi notificada.' }]);
        }
      }
    }, 850);
  };

  const enviarTexto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    lidarComResposta(inputValue, inputValue);
  };

  const getPlaceholder = () => {
    switch (passoAtual) {
      case 'telefone': return '(00) 00000-0000';
      case 'email': return 'seuemail@exemplo.com';
      case 'cpf': return '000.000.000-00';
      case 'rg': return 'Ex: 12.345.678-9 ou SSP/MA';
      case 'cep': return '00000-000';
      case 'salario': return 'R$ 0,00';
      default: return 'Escreva sua resposta...';
    }
  };

  const getInputType = () => {
    if (['cpf', 'cep', 'telefone', 'salario'].includes(passoAtual)) return 'tel';
    if (passoAtual === 'email') return 'email';
    return 'text';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-6">
      <div className="chat-container">
        
        {/* CABEÇALHO */}
        <div className="chat-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-[#13233d] text-lg border-2 border-[#b2cee2]">
              ADV
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-none">Escritório Parceiro</span>
              <span className="text-[10px] text-[#b2cee2] font-bold uppercase mt-1">Powered by Nexum</span>
            </div>
          </div>
          <div className="bg-[#d1d871] text-[#13233d] text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
            Seguro
          </div>
        </div>

        {/* MENSAGENS */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto flex flex-col gap-5 bg-gray-50/50">
          {chatLog.map((msg) => (
            <div key={msg.id} className={msg.remetente === 'user' ? 'bolha-user' : 'bolha-bot'}>
              {msg.texto}
            </div>
          ))}
          <div ref={chatFimRef} />
        </div>

        {/* RODAPÉ E CONTROLES */}
        <div className="p-4 sm:p-5 bg-white border-t border-gray-100 shadow-[0_-4px_20px_-15px_rgba(0,0,0,0.1)]">
          
          {['nome', 'telefone', 'email', 'cpf', 'rg', 'cep', 'endereco_compl', 'empresa', 'funcao', 'salario', 'verbas_pendentes', 'observacoes'].includes(passoAtual) && (
            <form onSubmit={enviarTexto} className="flex gap-2">
              <input 
                type={getInputType()} 
                value={inputValue} 
                onChange={handleInputChange}
                placeholder={getPlaceholder()} 
                className="input-padrao"
                autoFocus
              />
              <button type="submit" disabled={!inputValue.trim()} className="btn-enviar">
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
                className="input-padrao"
                autoFocus
              />
              <button type="submit" className="btn-enviar">Confirmar</button>
            </form>
          )}

          {passoAtual === 'upload_docs' && (
            <div className="flex flex-col gap-3">
              <label className="w-full p-5 bg-gray-50 border-2 border-dashed border-[#b2cee2] rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-[#b2cee2]/10 transition-colors">
                <svg className="w-8 h-8 text-[#3a4f99] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                <span className="text-sm font-bold text-[#13233d]">Anexar PDF ou Imagens</span>
                <input 
                  type="file" 
                  className="hidden" 
                  multiple 
                  onChange={(e) => {
                    const arquivos = e.target.files?.length || 0;
                    if(arquivos > 0) lidarComResposta(`[${arquivos} ARQUIVOS]`, `Anexei ${arquivos} arquivo(s).`);
                  }} 
                />
              </label>
              <button onClick={() => lidarComResposta('nenhum_arquivo', 'Não tenho arquivos agora')} className="w-full p-3 text-gray-400 hover:text-[#3a4f99] font-semibold text-sm">
                Pular esta etapa
              </button>
            </div>
          )}

          {passoAtual === 'lgpd' && (
            <div className="flex flex-col gap-3">
              <button onClick={() => lidarComResposta('sim', 'Sim, eu concordo')} className="btn-lgpd">Sim, aceito iniciar de forma segura</button>
              <button onClick={() => lidarComResposta('nao', 'Não concordo')} className="w-full p-2 text-gray-400 font-medium">Não concordo</button>
            </div>
          )}

          {['carteira_assinada', 'salario_por_fora', 'condicoes_trabalho', 'pejotizacao', 'subordinacao'].includes(passoAtual) && (
            <div className="flex gap-3">
              <button onClick={() => lidarComResposta('sim', 'Sim')} className="btn-sim">Sim</button>
              <button onClick={() => lidarComResposta('nao', 'Não')} className="btn-nao">Não</button>
            </div>
          )}

          {passoAtual === 'situacao' && (
            <div className="flex flex-col gap-2.5">
              <button onClick={() => lidarComResposta('demitido_sem_justa', 'Fui demitido sem justa causa')} className="btn-lista">Fui demitido sem justa causa</button>
              <button onClick={() => lidarComResposta('pedido_demissao', 'Eu pedi demissão')} className="btn-lista">Eu pedi demissão</button>
              <button onClick={() => lidarComResposta('demitido_justa_causa', 'Fui demitido por justa causa')} className="btn-lista">Fui demitido por justa causa</button>
              <button onClick={() => lidarComResposta('ainda_trabalhando', 'Ainda estou trabalhando lá')} className="btn-lista">Ainda estou trabalhando lá</button>
            </div>
          )}

          {passoAtual === 'fgts_rescisao' && (
            <div className="flex flex-col gap-2.5">
              <button onClick={() => lidarComResposta('pagou_tudo', 'Pagou tudo certinho')} className="btn-lista">Pagou tudo certinho</button>
              <button onClick={() => lidarComResposta('nao_pagou_fgts', 'Não depositou o FGTS')} className="btn-lista text-red-600">Não depositou o FGTS</button>
              <button onClick={() => lidarComResposta('nao_pagou_nada', 'Não pagou FGTS nem rescisão')} className="btn-lista text-red-600">Não pagou FGTS nem rescisão</button>
            </div>
          )}

          {passoAtual === 'horas_extras' && (
            <div className="flex flex-col gap-2.5">
              <button onClick={() => lidarComResposta('faz_e_recebe', 'Faço e recebo certinho')} className="btn-lista">Faço e recebo certinho</button>
              <button onClick={() => lidarComResposta('faz_mas_nao_recebe', 'Faço mas não recebo')} className="btn-lista text-orange-600">Faço mas não recebo</button>
              <button onClick={() => lidarComResposta('nao_faz', 'Não faço horas extras')} className="btn-lista">Não faço horas extras</button>
            </div>
          )}

          {passoAtual === 'fim' && (
            <div className="text-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-sm font-bold" style={{ color: 'var(--color-cerulean)' }}>Ficha de Atendimento Concluída.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Triagem;