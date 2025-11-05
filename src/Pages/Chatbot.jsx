import React, { useState, useEffect } from 'react';
import { createWorker } from 'tesseract.js';
import axios from 'axios';

const PRIMARY_COLOR = '#004D40'; 
const BACKGROUND_LIGHT = '#F9F9F9'; 
const BOT_MESSAGE_BG = '#EAEAEA'; 
const CHAT_STYLES = {
  desktop: { width: '420px', maxHeight: '600px', height: '500px' },
  mobile: { width: '100%', height: '100%', top: 0, right: 0, bottom: 0, left: 0, borderRadius: 0 }
};


let ocrWorker = null;

const Chatbot = ({ isOpen, setIsOpen }) => {
  const [messages, setMessages] = useState([]); 
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingDocumentText, setPendingDocumentText] = useState(''); 
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);


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
      }
    };
  }, []);


  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 768;
  const currentStyles = isMobile ? CHAT_STYLES.mobile : { ...CHAT_STYLES.desktop, bottom: '80px', right: '20px' };

  const sendToBackend = async (userQuestion) => {
    let messageToSend = userQuestion;

    if (pendingDocumentText) {
     
      messageToSend = `DOCUMENTO PARA ANÁLISE: """${pendingDocumentText}""" PERGUNTA JURÍDICA: ${userQuestion}`;
      setPendingDocumentText(''); 
    }
    
    try {
      const response = await axios.post('http://localhost:5001/chat', {
        message: messageToSend
      });
      return response.data.reply;
    } catch (err) {
      console.error("Erro a contactar o backend:", err);
      return "Desculpe, ocorreu um erro ao contactar o servidor.";
    }
  };


  const performOcrAnalysis = async (file) => {
    if (!ocrWorker) throw new Error("Tesseract Worker não inicializado.");
    
    const { data: { text } } = await ocrWorker.recognize(file, 'por', { logger: m => console.log(m) });
    const summary = text.substring(0, 200) + (text.length > 200 ? '...' : '');
    return { rawText: text, summary };
  };


  

  const handleSendMessage = async (textToSend) => {
    if (isProcessing) return; 
    
    const messageText = textToSend || inputValue;
    if (!messageText.trim()) return;

    setMessages(prev => [...prev, { text: messageText, sender: 'user' }]);
    setInputValue('');
    setIsProcessing(true);

    // Mensagem de processamento
    const processingMessage = { text: 'A gerar resposta...', sender: 'bot', temp: true };
    setMessages(prev => [...prev, processingMessage]);
    const botReply = await sendToBackend(messageText);
    setMessages(prev => {
      const filtered = prev.filter(msg => !msg.temp);
      return [...filtered, { text: botReply, sender: 'bot' }];
    });
    
    setIsProcessing(false);
  };


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
        { text: `✅ Texto extraído com sucesso: ${summary} \n\n**O que gostaria de saber sobre este documento?** Por favor, digite a sua pergunta.`, sender: 'bot' }
      ]);
      
      setIsProcessing(false); 

    } catch (error) {
      console.error("Erro no Tesseract/OCR:", error);
      setMessages(prev => prev.filter(msg => !msg.temp)); 
      setMessages(prev => [...prev, { text: '❌ Erro ao processar a imagem. Tente novamente.', sender: 'bot' }]);
      setIsProcessing(false);
    }
  };
  
 
  const handleClearChat = () => {
    setMessages([]);
    setPendingDocumentText(''); 
  };


  return (
    <div style={{ 
      ...currentStyles, 
      display: isOpen ? 'flex' : 'none', 
      flexDirection: 'column', 
      position: 'fixed', 
      borderRadius: isMobile ? 0 : '16px', 
      boxShadow: isMobile ? 'none' : '0 8px 30px rgba(0,0,0,0.15)', 
      backgroundColor: BACKGROUND_LIGHT, 
      fontFamily: 'Arial, sans-serif', 
      zIndex: 1000 
    }}>
      
      {/* HEADER */}
      <div style={{ padding: '0.75rem 1rem', backgroundColor: PRIMARY_COLOR, color: '#fff', borderRadius: isMobile ? '0' : '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: isMobile ? '1.2rem' : '1.1rem' }}>Assistente Jurídico IPAJ</h3>
        <div>
          <button onClick={handleClearChat} style={{ background: 'none', border: 'none', color: '#fff', fontSize: isMobile ? '1.5rem' : '1.2rem', marginLeft: '0.5rem', cursor: 'pointer' }}>🗑️</button>
          <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: isMobile ? '1.5rem' : '1.2rem', marginLeft: '0.5rem', cursor: 'pointer' }}>×</button>
        </div>
      </div>

      {/* MENSAGENS */}
      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', backgroundColor: BACKGROUND_LIGHT }}>
        {messages.length === 0 ? <p style={{ textAlign: 'center', color: '#888' }}>Olá! Diga-me o seu assunto ou envie um documento.</p> :
          messages.map((msg, i) => (
            <div key={i} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left', margin: '0.5rem 0' }}>
              {msg.image && <img src={msg.image} alt="Envio" style={{ maxWidth: '80%', borderRadius: '8px', marginBottom: '0.5rem' }} />}
              <div style={{ display: 'inline-block', padding: '0.75rem 1rem', borderRadius: '20px', maxWidth: '80%', 
                backgroundColor: msg.sender === 'user' ? PRIMARY_COLOR : BOT_MESSAGE_BG, 
                color: msg.sender === 'user' ? '#fff' : '#333', whiteSpace: 'pre-wrap', 
                marginLeft: msg.sender === 'bot' ? 0 : 'auto', marginRight: msg.sender === 'user' ? 0 : 'auto' }}
        
                dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}>
              </div>
            </div>
          ))
        }
      </div>

  
      <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid #eee', display: 'flex', alignItems: 'center' }}>
        
        <input type="file" accept="image/*" id="fileInput" onChange={handleFileChange} style={{ display: 'none' }} disabled={isProcessing} />
        <label htmlFor="fileInput" style={{ cursor: isProcessing ? 'default' : 'pointer', fontSize: isMobile ? '1.8rem' : '1.5rem', marginRight: '0.5rem', opacity: isProcessing ? 0.5 : 1 }}>📷</label>

   
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
              paddingRight: isMobile ? '60px' : '70px', 
              borderRadius: '25px', 
              fontSize: '1rem',
              border: `1px solid ${isProcessing ? PRIMARY_COLOR : '#ccc'}`,
              backgroundColor: isProcessing ? '#f5f5f5' : '#fff',
              boxSizing: 'border-box', 
            }} 
          />
        
          <button 
            onClick={() => handleSendMessage()} 
            disabled={isProcessing || !inputValue.trim()}
            style={{ 
              position: 'absolute', 
              right: '5px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              padding: isMobile ? '0.4rem 0.6rem' : '0.5rem 0.75rem', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '25px', 
              cursor: 'pointer', 
              fontWeight: 'bold', 
              backgroundColor: PRIMARY_COLOR,
              fontSize: '0.9rem',
              opacity: (isProcessing || !inputValue.trim()) ? 0.5 : 1,
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