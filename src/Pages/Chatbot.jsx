import React, { useState, useEffect } from 'react';
import { createWorker } from 'tesseract.js';
import axios from 'axios';

// --- NOVAS CONSTANTES DE ESTILO (Moderno e Focado em Verde) ---
const PRIMARY_COLOR = '#00695C';      // Um verde teal mais escuro
const SECONDARY_COLOR = '#4DB6AC';  // Um verde teal mais claro para destaque
const BACKGROUND_LIGHT = '#F4F7F6'; // Fundo levemente acinzentado
const BOT_MESSAGE_BG = '#E0F2F1';  // Verde muito claro para o balão do bot
const USER_MESSAGE_BG = PRIMARY_COLOR; // A cor primária para o balão do usuário

// --- NOVAS CONSTANTES DE CHAT ---
const CHAT_STYLES = {
  desktop: { width: '400px', maxHeight: '600px', height: '550px', bottom: '80px', right: '20px' },
  mobile: { width: '100%', height: '100%', top: 0, right: 0, bottom: 0, left: 0, borderRadius: 0 }
};

// ----------------------------

let ocrWorker = null; // Variável global para o Tesseract Worker

const Chatbot = ({ isOpen, setIsOpen }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingDocumentText, setPendingDocumentText] = useState('');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  // NOVO ESTADO: Para controlar a expansão para tela cheia (desktop)
  const [isExpanded, setIsExpanded] = useState(false);

  // --- EFEITO 1: Inicialização e Terminação do Tesseract Worker ---
  useEffect(() => {
    const initializeWorker = async () => {
      if (!ocrWorker) {
        ocrWorker = await createWorker('por');
        console.log("Tesseract Worker inicializado.");
      }
    };

    initializeWorker();

    return () => {
      if (ocrWorker) {
        ocrWorker.terminate();
        ocrWorker = null;
        console.log("Tesseract Worker terminado.");
      }
    };
  }, []);

  // --- EFEITO 2: Responsividade ---
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 768;

  // Lógica de estilo aprimorada
  const currentStyles = (() => {
    if (isMobile || isExpanded) {
      return CHAT_STYLES.mobile;
    }
    return CHAT_STYLES.desktop;
  })();

  // --- FUNÇÃO: Envio de Mensagem/Documento para o Backend ---
  const sendToBackend = async (userQuestion) => {
    let messageToSend = userQuestion;
    const backendUrl = 'http://localhost:5001/chat'; // URL do seu servidor Node.js/Express

    if (pendingDocumentText) {
      messageToSend = `DOCUMENTO PARA ANÁLISE: """${pendingDocumentText}""" PERGUNTA JURÍDICA: ${userQuestion}`;
      setPendingDocumentText('');
    }

    try {
      const response = await axios.post(backendUrl, {
        message: messageToSend
      });
      return response.data.reply;
    } catch (err) {
      console.error("Erro a contactar o backend:", err);
      return "Desculpe, ocorreu um erro ao contactar o servidor backend.";
    }
  };

  // --- FUNÇÃO: Execução do OCR com Tesseract ---
  const performOcrAnalysis = async (file) => {
    if (!ocrWorker) throw new Error("Tesseract Worker não inicializado.");
    const { data: { text } } = await ocrWorker.recognize(file, 'por', {});

    const summary = text.substring(0, 200) + (text.length > 200 ? '...' : '');
    return { rawText: text, summary };
  };

  // --- HANDLER: Enviar Mensagem de Texto ---
  const handleSendMessage = async (textToSend) => {
    if (isProcessing) return;

    const messageText = textToSend || inputValue;
    if (!messageText.trim()) return;

    setMessages(prev => [...prev, { text: messageText, sender: 'user' }]);
    setInputValue('');
    setIsProcessing(true);

    const processingMessage = { text: 'A gerar resposta... 🧠', sender: 'bot', temp: true };
    setMessages(prev => [...prev, processingMessage]);

    const botReply = await sendToBackend(messageText);

    setMessages(prev => {
      const filtered = prev.filter(msg => !msg.temp);
      return [...filtered, { text: botReply, sender: 'bot' }];
    });

    setIsProcessing(false);
  };

  // --- HANDLER: Enviar Arquivo/Imagem (OCR) ---
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);

    const imageURL = URL.createObjectURL(file);

    setMessages(prev => [
      ...prev,
      { image: imageURL, sender: 'user', text: 'Documento enviado para análise.' },
      { text: `A processar documento, aguarde... ⏳`, sender: 'bot', temp: true }
    ]);

    try {
      const { rawText, summary } = await performOcrAnalysis(file);

      setPendingDocumentText(rawText);

      setMessages(prev => prev.filter(msg => !msg.temp));
      setMessages(prev => [
        ...prev,
        { text: `✅ **Texto extraído com sucesso:** "${summary}" \n\n**O que gostaria de saber sobre este documento?** Por favor, digite a sua pergunta.`, sender: 'bot' }
      ]);

    } catch (error) {
      console.error("Erro no Tesseract/OCR:", error);
      setMessages(prev => prev.filter(msg => !msg.temp));
      setMessages(prev => [...prev, { text: '❌ Erro ao processar a imagem. Tente novamente.', sender: 'bot' }]);
    } finally {
      setIsProcessing(false);
    }
    e.target.value = null;
  };

  // --- HANDLER: Limpar o Chat ---
  const handleClearChat = () => {
    setMessages([]);
    setPendingDocumentText('');
  };

  // --- HANDLER: Alternar Expansão (Desktop) ---
  const handleToggleExpand = () => {
      if (!isMobile) {
          setIsExpanded(prev => !prev);
      }
      // Se for mobile, o estilo já é full-screen, o botão fecha o chat
      if (isMobile && isExpanded) {
          setIsOpen(false);
      }
  };

  // Referência para scroll automático
  const messagesEndRef = React.useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  // Ícones para Expansão/Minimização
  const ExpandIcon = isExpanded ? '⬇️' : '⬆️';
  const CollapseIcon = '✖️'; // Substitui o 'x'
  const ToggleIcon = isExpanded ? 'CONTRACT' : 'EXPAND'; // Para a lógica do botão

  return (
    <div style={{
      ...currentStyles,
      display: isOpen ? 'flex' : 'none',
      flexDirection: 'column',
      position: 'fixed',
      borderRadius: isMobile ? 0 : '16px',
      // Sombra moderna
      boxShadow: isMobile ? 'none' : '0 10px 40px rgba(0,0,0,0.1)',
      backgroundColor: BACKGROUND_LIGHT,
      fontFamily: 'Roboto, Arial, sans-serif',
      zIndex: 1000,
      transition: 'all 0.3s ease-in-out', // Transição suave para expansão
    }}>

      {/* HEADER MODERNO */}
      <div style={{
        padding: '1rem',
        backgroundColor: PRIMARY_COLOR,
        color: '#fff',
        borderRadius: isMobile ? '0' : '16px 16px 0 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}>
        <h3 style={{ margin: 0, fontSize: isMobile ? '1.3rem' : '1.2rem', fontWeight: 'bold' }}>Assistente Jurídico IPAJ</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {/* Botão de Expansão/Contração (Apenas Desktop) */}
          {!isMobile && (
            <button
              onClick={handleToggleExpand}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '1.2rem',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
              }}
              title={isExpanded ? 'Voltar ao tamanho normal' : 'Expandir para tela cheia'}
            >
              {isExpanded ? '⤢' : '⤡'}
            </button>
          )}
          {/* Botão Limpar Chat */}
          <button onClick={handleClearChat} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }} title="Limpar conversa">🗑️</button>
          {/* Botão Fechar/Minimizar */}
          <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }} title="Fechar Chat">
              {isMobile ? CollapseIcon : '–'}
          </button>
        </div>
      </div>

      {/* MENSAGENS */}
      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', backgroundColor: BACKGROUND_LIGHT, display: 'flex', flexDirection: 'column' }}>
        {messages.length === 0 ? <p style={{ textAlign: 'center', color: '#888', margin: 'auto' }}>Olá! Diga-me o seu assunto ou envie um documento para análise.</p> :
          messages.map((msg, i) => (
            <div key={i} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left', margin: '0.5rem 0' }}>
              {/* Imagem com bordas arredondadas e sombra sutil */}
              {msg.image && <img src={msg.image} alt="Envio" style={{ maxWidth: '80%', borderRadius: '12px', marginBottom: '0.5rem', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }} />}
              <div style={{
                display: 'inline-block',
                padding: '0.75rem 1rem',
                borderRadius: '18px', // Balões mais arredondados
                maxWidth: '80%',
                backgroundColor: msg.sender === 'user' ? USER_MESSAGE_BG : BOT_MESSAGE_BG,
                color: msg.sender === 'user' ? '#fff' : '#333',
                whiteSpace: 'pre-wrap',
                // Sombra para dar profundidade aos balões
                boxShadow: msg.sender === 'user' ? '0 1px 3px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.1)',
                marginLeft: msg.sender === 'bot' ? 0 : 'auto', marginRight: msg.sender === 'user' ? 0 : 'auto'
              }}
                dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}>
              </div>
            </div>
          ))
        }
        <div ref={messagesEndRef} />
      </div>


      {/* INPUT AREA MODERNA */}
      <div style={{ padding: '1rem', borderTop: '1px solid #eee', display: 'flex', alignItems: 'center', backgroundColor: '#fff', borderRadius: isMobile ? '0' : '0 0 16px 16px' }}>

        {/* Botão de Anexo (Câmera/Arquivo) com estilo moderno */}
        <input type="file" accept="image/*" id="fileInput" onChange={handleFileChange} style={{ display: 'none' }} disabled={isProcessing} />
        <label htmlFor="fileInput" style={{
          cursor: isProcessing ? 'default' : 'pointer',
          fontSize: '1.5rem',
          marginRight: '0.75rem',
          opacity: isProcessing ? 0.5 : 1,
          color: SECONDARY_COLOR, // Cor de destaque
          transition: 'color 0.2s',
        }} title="Enviar Imagem/Documento">📄</label>


        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={pendingDocumentText ? "Digite sua pergunta sobre o documento..." : "Pergunte ou envie documento..."}
            disabled={isProcessing}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              paddingRight: isMobile ? '60px' : '80px',
              borderRadius: '25px', // Formato "pill"
              fontSize: '1rem',
              border: `1px solid ${isProcessing ? SECONDARY_COLOR : '#ddd'}`,
              backgroundColor: isProcessing ? BACKGROUND_LIGHT : '#fff',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
          />

          {/* Botão Enviar com estilo de destaque */}
          <button
            onClick={() => handleSendMessage()}
            disabled={isProcessing || !inputValue.trim()}
            style={{
              position: 'absolute',
              right: '4px',
              top: '50%',
              transform: 'translateY(-50%)',
              padding: isMobile ? '0.4rem 0.6rem' : '0.5rem 1rem',
              color: '#fff',
              border: 'none',
              borderRadius: '20px',
              cursor: (isProcessing || !inputValue.trim()) ? 'default' : 'pointer',
              fontWeight: '600',
              backgroundColor: SECONDARY_COLOR,
              fontSize: '0.9rem',
              opacity: (isProcessing || !inputValue.trim()) ? 0.6 : 1,
              transition: 'background-color 0.2s',
            }}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;