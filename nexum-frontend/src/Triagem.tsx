import { useState, useRef, useEffect } from 'react';
import type React from 'react';

interface Mensagem {
  id: number;
  remetente: 'bot' | 'user';
  texto: string;
}

// 🛠️ MÁSCARAS E VALIDAÇÕES

// Máscara Visual do CPF
const mascaraCPF = (valor: string) => {
  return valor.replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1'); 
};

// Algoritmo Real de Validação de CPF (Receita Federal)
const validarCPF = (cpf: string) => {
  const strCPF = cpf.replace(/\D/g, '');
  if (strCPF.length !== 11 || /^(\d)\1{10}$/.test(strCPF)) return false;
  
  let soma = 0;
  let resto;
  for (let i = 1; i <= 9; i++) soma += parseInt(strCPF.substring(i - 1, i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(strCPF.substring(9, 10))) return false;
  
  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(strCPF.substring(i - 1, i)) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(strCPF.substring(10, 11))) return false;
  
  return true;
};

const mascaraCEP = (valor: string) => {
  return valor.replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1'); 
};

const mascaraTelefone = (valor: string) => {
  // 1. Fluxo Internacional: Se começar com +, deixa livre apenas com números
  if (valor.startsWith('+')) {
    const numeros = valor.replace(/\D/g, '');
    return '+' + numeros.substring(0, 15); // Limite seguro para números internacionais
  }

  // 2. Fluxo Brasileiro: Remove tudo que não for número
  let v = valor.replace(/\D/g, '');

  // 3. Aplica a máscara dependendo do tamanho (Fixo vs Celular)
  if (v.length <= 10) {
    // Formato Fixo: (XX) XXXX-XXXX
    v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
    v = v.replace(/(\d{4})(\d)/, '$1-$2');
  } else {
    // Formato Celular: (XX) 9XXXX-XXXX
    v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
    v = v.replace(/(\d{5})(\d)/, '$1-$2');
  }

  return v.substring(0, 15); // Trava o tamanho máximo exato do "(XX) 9XXXX-XXXX"
};

const mascaraMoeda = (valor: string) => {
  const apenasNumeros = valor.replace(/\D/g, '');
  const valorFormatado = (Number(apenasNumeros) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  return valorFormatado === 'R$ 0,00' ? '' : valorFormatado;
};

const mascaraRG = (valor: string) => {
  // Permite letras, números, PONTOS e TRAÇOS.
  // Remove espaços, arrobas, emojis e qualquer "sujeira".
  let v = valor.toUpperCase().replace(/[^A-Z0-9.\-]/g, '');

  // Limita a 18 caracteres. 
  // Isso dá espaço de sobra para os 13 dígitos do Maranhão + os pontos e traços que o cliente quiser colocar.
  return v.substring(0, 18);
};


function Triagem() {
  const [chatLog, setChatLog] = useState<Mensagem[]>([
    { id: 1, remetente: 'bot', texto: 'Olá! Sou o assistente virtual do escritório. Seus dados estão protegidos por criptografia e total sigilo jurídico. Você concorda com a nossa política de privacidade (LGPD)?' }
  ]);
  const [passoAtual, setPassoAtual] = useState<string>('lgpd');
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [inputValue, setInputValue] = useState('');
  const [historicoPassos, setHistoricoPassos] = useState<string[]>([]);
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

  const desfazerUltimoPasso = () => {
    if (historicoPassos.length === 0) return; // Não há para onde voltar

    // 1. Pega o último passo que ficou na memória
    const memoriaAtualizada = [...historicoPassos];
    const passoAnterior = memoriaAtualizada.pop();

    // 2. Atualiza a memória e volta o passo da máquina de estados
    setHistoricoPassos(memoriaAtualizada);
    if (passoAnterior) setPassoAtual(passoAnterior);

    // 3. Remove a última pergunta do bot e a resposta errada do usuário visualmente
    setChatLog(prev => prev.slice(0, -2));
  };

  const lidarComResposta = (valorParaBanco: string, textoParaChat: string) => {
    let textoExibido = textoParaChat;
    let valorLimpoParaBanco = valorParaBanco;

    // Formatação de datas para exibição no chat
    if (['data_admissao', 'data_demissao'].includes(passoAtual)) {
        const partes = valorParaBanco.split('-');
        if (partes.length === 3) textoExibido = `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

// 🧹 A VASSOURA DA NORMALIZAÇÃO
    // Se for CPF, RG, CEP ou Telefone, removemos pontos, traços, parênteses e espaços.
    // O regex /[^a-zA-Z0-9+]/g significa: "Apague tudo que NÃO for letra, número ou o sinal de +"
    if (['cpf', 'rg', 'cep', 'telefone'].includes(passoAtual)) {
        valorLimpoParaBanco = valorParaBanco.replace(/[^a-zA-Z0-9+]/g, '');
    }

    // 1. Renderiza a resposta com a formatação bonitinha no chat para o usuário ver
    setChatLog(prev => [...prev, { id: Date.now(), remetente: 'user', texto: textoExibido }]);
    setInputValue('');

    // 🛡️ 2. BARREIRA DE VALIDAÇÃOs DO CPF (agora usando o valorLimpo)
    if (passoAtual === 'cpf' && !validarCPF(valorLimpoParaBanco)) {
      setTimeout(() => {
        setChatLog(prev => [...prev, { id: Date.now() + 1, remetente: 'bot', texto: 'Hmm, este CPF parece ser inválido. Por favor, verifique os números e digite novamente:' }]);
      }, 600);
      return; 
    }

    // 3. Salva a resposta LIMPA no estado que vai para a API
    const novasRespostas = { ...respostas, [passoAtual]: valorLimpoParaBanco };
    setRespostas(novasRespostas);

    // 4. Árvore de Decisão Dinâmica
    setTimeout(async () => {
      setHistoricoPassos(prev => [...prev, passoAtual]);

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
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Certo. Agora digite o seu RG (apenas números e letras):' }]);
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
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Entendi. E qual é a sua situação atual com a empresa?' }]);
        setPassoAtual('situacao');
      }
      else if (passoAtual === 'situacao') {
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Qual foi a data aproximada em que você começou a trabalhar lá?' }]);
        setPassoAtual('data_admissao');
      }
      else if (passoAtual === 'data_admissao') {
        if (novasRespostas['situacao'] === 'ainda_trabalhando') {
          setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Como você ainda está na empresa, vamos pular a data de saída. Qual é o seu salário mensal atual?' }]);
          setPassoAtual('salario'); // Pula a demissão
        } else {
          setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'E qual foi o seu último dia (data de saída)?' }]);
          setPassoAtual('data_demissao');
        }
      }
      else if (passoAtual === 'data_demissao') {
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Qual era o valor do seu último salário mensal?' }]);
        setPassoAtual('salario');
      }
      else if (passoAtual === 'salario') {
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Você trabalhava com a carteira assinada (CLT) nessa empresa?' }]);
        setPassoAtual('carteira_assinada');
      }
      else if (passoAtual === 'carteira_assinada') {
        if (valorParaBanco === 'nao') {
          setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Entendi. Eles te obrigaram a abrir um CNPJ (MEI) ou assinar contrato de prestação de serviços?' }]);
          setPassoAtual('pejotizacao');
        } else {
          setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Certo. Você recebia alguma parte do seu salário "por fora"?' }]);
          setPassoAtual('salario_por_fora');
        }
      }
      else if (passoAtual === 'pejotizacao') {
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Mesmo sem carteira, você tinha horário fixo e recebia ordens diretas de um chefe (subordinação)?' }]);
        setPassoAtual('subordinacao');
      }
      else if (passoAtual === 'subordinacao') {
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Certo. Você recebia alguma parte do seu salário "por fora"?' }]);
        setPassoAtual('salario_por_fora'); 
      }
      else if (passoAtual === 'salario_por_fora') {
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Você trabalhava com barulho forte, produtos químicos, ou adquiriu alguma doença no trabalho?' }]);
        setPassoAtual('condicoes_trabalho');
      }
      else if (passoAtual === 'condicoes_trabalho') {
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Sobre sua jornada: você costumava fazer horas extras ou trabalhar de madrugada? Eram pagas?' }]);
        setPassoAtual('horas_extras');
      }
      else if (passoAtual === 'horas_extras') {
        // 🧠 LÓGICA INTELIGENTE: Separação de fluxo PJ vs CLT
        if (novasRespostas['carteira_assinada'] === 'nao') {
          // FLUXO PJ: Não faz sentido perguntar de FGTS/13º padrão se eles nem carteira tinham.
          setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Como você atuava sem carteira, nosso foco será comprovar o vínculo para cobrar todos os seus direitos (Férias, 13º, FGTS). Se tiver prints de WhatsApp recebendo ordens ou contratos, pode anexar agora.' }]);
          setPassoAtual('upload_docs');
        } else {
          // FLUXO CLT: Segue as perguntas normais de rescisão
          if (novasRespostas['situacao'] !== 'ainda_trabalhando') {
            setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'A empresa depositou seu FGTS corretamente e pagou suas verbas de rescisão?' }]);
            setPassoAtual('fgts_rescisao');
          } else {
            setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'A empresa deixou de pagar suas Férias ou o seu 13º salário em algum ano?' }]);
            setPassoAtual('verbas_pendentes');
          }
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
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'Tudo salvo! Deseja relatar mais algum detalhe específico (humilhações, cobranças abusivas, etc)?' }]);
        setPassoAtual('observacoes');
      }
      else if (passoAtual === 'observacoes') {
        setChatLog(prev => [...prev, { id: Date.now(), remetente: 'bot', texto: 'A encriptar e a guardar os seus dados. Um momento, por favor...' }]);
        
        try {
          const payloadDaTriagem = {
            ...novasRespostas,
            office_id: "escritorio-test-123" // Lembrete: ajuste para o seu ID real no banco
          };

          const respostaApi = await fetch('http://localhost:3000/triagem', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payloadDaTriagem)
          });

          if (!respostaApi.ok) {
            throw new Error('Falha ao comunicar com o servidor');
          }

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
      case 'rg': return 'Digite o número do seu documento...';
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
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-6 bg-[#ecece5]">
      <div className="chat-container bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col" style={{ height: '85vh' }}>
        
        {/* CABEÇALHO */}
        <div className="chat-header bg-white border-b border-gray-100 p-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#3a4f99] rounded-full flex items-center justify-center font-bold text-[#d1d871] text-lg shadow-inner">
              A
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-none text-[#13233d]">Escritório Parceiro</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase mt-1">Powered by Nexum</span>
            </div>
          </div>
          <div className="bg-[#d1d871]/20 text-[#13233d] text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-[#d1d871]">
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
            Seguro
          </div>
        </div>

        {/* MENSAGENS */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto flex flex-col gap-5 bg-gray-50/50">
          {chatLog.map((msg) => (
            <div key={msg.id} className={`flex ${msg.remetente === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-5 py-3.5 rounded-2xl max-w-[85%] text-[15px] font-medium leading-relaxed shadow-sm ${
                msg.remetente === 'user' 
                  ? 'bg-[#3a4f99] text-white rounded-br-sm' 
                  : 'bg-white border border-gray-200 text-[#13233d] rounded-bl-sm'
              }`}>
                {msg.texto}
              </div>
            </div>
          ))}
          <div ref={chatFimRef} />
        </div>

        {/* RODAPÉ E CONTROLES */}
        <div className="p-4 sm:p-5 bg-white border-t border-gray-100">
          
          {['nome', 'telefone', 'email', 'cpf', 'rg', 'cep', 'endereco_compl', 'empresa', 'funcao', 'salario', 'verbas_pendentes', 'observacoes'].includes(passoAtual) && (
            <div className="flex gap-2 w-full">
              {/* Botão de Voltar (Só aparece se houver histórico) */}
              {historicoPassos.length > 0 && (
                <button 
                  type="button" 
                  onClick={desfazerUltimoPasso}
                  className="bg-white border border-gray-200 text-gray-500 p-3.5 rounded-xl hover:bg-gray-50 hover:text-[#3a4f99] transition-colors shadow-sm flex-shrink-0"
                  title="Corrigir resposta anterior"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
                </button>
              )}

              <form onSubmit={enviarTexto} className="flex gap-3 flex-1">
                <input 
                  type={getInputType()} 
                  value={inputValue} 
                  onChange={handleInputChange}
                  placeholder={getPlaceholder()} 
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-[#13233d] focus:outline-none focus:ring-2 focus:ring-[#3a4f99] focus:bg-white transition-all placeholder:text-gray-400"
                  autoFocus
                />
                <button type="submit" disabled={!inputValue.trim()} className="bg-[#3a4f99] text-white p-3.5 rounded-xl hover:bg-[#13233d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex-shrink-0">
                  <svg width="20" height="20" className="transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                </button>
              </form>
            </div>
          )}

          {['data_admissao', 'data_demissao'].includes(passoAtual) && (
            <form onSubmit={enviarTexto} className="flex gap-3">
              <input 
                type="date" 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-[#13233d] focus:outline-none focus:ring-2 focus:ring-[#3a4f99]"
                autoFocus
              />
              <button type="submit" className="bg-[#3a4f99] text-white px-6 py-3.5 rounded-xl font-bold hover:bg-[#13233d] transition-colors shadow-sm">Confirmar</button>
            </form>
          )}

          {passoAtual === 'upload_docs' && (
            <div className="flex flex-col gap-3">
              <label className="w-full p-5 bg-gray-50 border-2 border-dashed border-[#3a4f99]/30 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-[#3a4f99]/5 transition-colors group">
                <svg className="w-8 h-8 text-[#3a4f99] mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
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
              <button onClick={() => lidarComResposta('nenhum_arquivo', 'Não tenho arquivos agora')} className="w-full p-3 text-gray-400 hover:text-[#3a4f99] font-bold text-sm transition-colors">
                Pular esta etapa
              </button>
            </div>
          )}

          {passoAtual === 'lgpd' && (
            <div className="flex flex-col gap-3">
              <button onClick={() => lidarComResposta('sim', 'Sim, eu concordo')} className="bg-[#3a4f99] text-white py-3.5 rounded-xl font-bold text-[15px] hover:bg-[#13233d] transition-colors shadow-sm">Sim, aceito iniciar de forma segura</button>
              <button onClick={() => lidarComResposta('nao', 'Não concordo')} className="w-full p-2 text-gray-400 hover:text-red-500 font-bold text-sm transition-colors">Não concordo</button>
            </div>
          )}

          {['carteira_assinada', 'salario_por_fora', 'condicoes_trabalho', 'pejotizacao', 'subordinacao'].includes(passoAtual) && (
            <div className="flex gap-3">
              <button onClick={() => lidarComResposta('sim', 'Sim')} className="flex-1 bg-white border-2 border-gray-200 text-[#13233d] py-3.5 rounded-xl font-bold hover:border-[#3a4f99] transition-colors">Sim</button>
              <button onClick={() => lidarComResposta('nao', 'Não')} className="flex-1 bg-white border-2 border-gray-200 text-[#13233d] py-3.5 rounded-xl font-bold hover:border-red-400 transition-colors">Não</button>
            </div>
          )}

          {passoAtual === 'situacao' && (
            <div className="flex flex-col gap-2.5">
              <button onClick={() => lidarComResposta('demitido_sem_justa', 'Fui demitido sem justa causa')} className="bg-white border border-gray-200 text-[#13233d] py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors text-left px-5">Fui demitido sem justa causa</button>
              <button onClick={() => lidarComResposta('pedido_demissao', 'Eu pedi demissão')} className="bg-white border border-gray-200 text-[#13233d] py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors text-left px-5">Eu pedi demissão</button>
              <button onClick={() => lidarComResposta('demitido_justa_causa', 'Fui demitido por justa causa')} className="bg-white border border-gray-200 text-[#13233d] py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors text-left px-5">Fui demitido por justa causa</button>
              <button onClick={() => lidarComResposta('ainda_trabalhando', 'Ainda estou trabalhando lá')} className="bg-white border border-gray-200 text-[#13233d] py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors text-left px-5">Ainda estou trabalhando lá</button>
            </div>
          )}

          {passoAtual === 'fgts_rescisao' && (
            <div className="flex flex-col gap-2.5">
              <button onClick={() => lidarComResposta('pagou_tudo', 'Pagou tudo certinho')} className="bg-white border border-gray-200 text-[#13233d] py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors text-left px-5">Pagou tudo certinho</button>
              <button onClick={() => lidarComResposta('nao_pagou_fgts', 'Não depositou o FGTS')} className="bg-white border border-red-200 text-red-700 py-3 rounded-xl font-medium hover:bg-red-50 transition-colors text-left px-5">Não depositou o FGTS</button>
              <button onClick={() => lidarComResposta('nao_pagou_nada', 'Não pagou FGTS nem rescisão')} className="bg-white border border-red-200 text-red-700 py-3 rounded-xl font-medium hover:bg-red-50 transition-colors text-left px-5">Não pagou FGTS nem rescisão</button>
            </div>
          )}

          {passoAtual === 'horas_extras' && (
            <div className="flex flex-col gap-2.5">
              <button onClick={() => lidarComResposta('faz_e_recebe', 'Faço e recebo certinho')} className="bg-white border border-gray-200 text-[#13233d] py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors text-left px-5">Faço e recebo certinho</button>
              <button onClick={() => lidarComResposta('faz_mas_nao_recebe', 'Faço mas não recebo')} className="bg-white border border-orange-200 text-orange-700 py-3 rounded-xl font-medium hover:bg-orange-50 transition-colors text-left px-5">Faço mas não recebo</button>
              <button onClick={() => lidarComResposta('nao_faz', 'Não faço horas extras')} className="bg-white border border-gray-200 text-[#13233d] py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors text-left px-5">Não faço horas extras</button>
            </div>
          )}

          {passoAtual === 'fim' && (
            <div className="text-center p-4 bg-[#d1d871]/20 rounded-xl border border-[#d1d871]">
              <p className="text-[15px] font-bold text-[#13233d]">Ficha de Atendimento Concluída.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Triagem;