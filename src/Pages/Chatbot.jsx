import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import axios from 'axios';

const PRIMARY_COLOR = '#004D40'; 
const BACKGROUND_LIGHT = '#F9F9F9'; 
const BOT_MESSAGE_BG = '#EAEAEA'; 

const Chatbot = ({ isOpen, setIsOpen }) => {
  const [messages, setMessages] = useState([]); 
  const [inputValue, setInputValue] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null); 

  const sendToBackend = async (userMessage) => {
    try {
      const response = await axios.post('http://localhost:5001/chat', {
        message: userMessage
      });
      return response.data.reply;
    } catch (err) {
      console.error("Erro a contactar", err);
      return "Desculpe, ocorreu um erro ao contactar o servidor.";
    }
  };


  const performOcrAnalysis = async (file, ocrLanguage) => {
    return new Promise((resolve, reject) => {
      Tesseract.recognize(file, ocrLanguage, { logger: m => console.log(m) })
        .then(({ data: { text } }) => {
          const summary = text.substring(0, 200) + (text.length > 200 ? '...' : '');
          resolve({ rawText: text, summary });
        })
        .catch(error => reject(error));
    });
  };


  const playSound = () => {
    const audio = new Audio('https://www.myinstants.com/media/sounds/bell-ring.mp3');
    audio.volume = 0.5; 
    audio.play().catch(e => console.error("Erro ao tocar som:", e)); 
  };

  const handleSendMessage = async (textToSend) => {
    const messageText = textToSend || inputValue;
    if (!messageText.trim()) return;

    setMessages(prev => [...prev, { text: messageText, sender: 'user' }]);
    setInputValue('');

    const processingMessage = { text: 'A gerar resposta...', sender: 'bot', temp: true };
    setMessages(prev => [...prev, processingMessage]);

    const botReply = await sendToBackend(messageText);

    setMessages(prev => {
      const filtered = prev.filter(msg => !msg.temp);
      return [...filtered, { text: botReply, sender: 'bot' }];
    });

    playSound();
  };

  // --- Upload de imagem 
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageURL = URL.createObjectURL(file);
    setUploadedImage(imageURL);

    setMessages(prev => [
      ...prev,
      { image: imageURL, sender: 'user', text: 'Imagem enviada' },
      { text: `...`, sender: 'bot' }
    ]);

    try {
      const { rawText, summary } = await performOcrAnalysis(file, 'por');
      setMessages(prev => [
        ...prev,
        { text: 'Texto extraído: ' + summary, sender: 'bot' }
      ]);

      const botReply = await sendToBackend(rawText);
      setMessages(prev => [...prev, { text: botReply, sender: 'bot' }]);
      playSound();
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { text: 'Erro ao processar a imagem.', sender: 'bot' }]);
    }
  };
  
 
  const handleClearChat = () => setMessages([]);


  return (
    <div style={{ display: isOpen ? 'flex' : 'none', flexDirection: 'column', position: 'fixed', bottom: '80px', right: '20px', width: '420px', maxHeight: '600px', height: '500px', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.15)', backgroundColor: BACKGROUND_LIGHT, fontFamily: 'Arial, sans-serif', zIndex: 1000 }}>
      
      {/* footer */}
      <div style={{ padding: '0.75rem 1rem', backgroundColor: PRIMARY_COLOR, color: '#fff', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Assistente Jurídico</h3>
        <div>
          <button onClick={handleClearChat} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', marginLeft: '0.5rem', cursor: 'pointer' }}>🗑️</button>
          <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', marginLeft: '0.5rem', cursor: 'pointer' }}>×</button>
        </div>
      </div>

      {/* mensagens */}
      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', backgroundColor: BACKGROUND_LIGHT }}>
        {messages.length === 0 ? <p style={{ textAlign: 'center', color: '#888' }}>Olá! Diga-me o seu assunto ou envie um documento.</p> :
          messages.map((msg, i) => (
            <div key={i} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left', margin: '0.5rem 0' }}>
              {msg.image && <img src={msg.image} alt="Envio" style={{ maxWidth: '80%', borderRadius: '8px' }} />}
              <div style={{ display: 'inline-block', padding: '0.75rem 1rem', borderRadius: '20px', maxWidth: '80%', marginTop: '0.5rem', 
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
        
        <input type="file" accept="image/*" id="fileInput" onChange={handleFileChange} style={{ display: 'none' }} />
        <label htmlFor="fileInput" style={{ cursor: 'pointer', fontSize: '1.5rem', marginRight: '0.5rem' }}>📷</label>

   
        <div style={{ flex: 1, position: 'relative' }}>
          <input 
            type="text" 
            value={inputValue} 
            onChange={(e) => setInputValue(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} 
            placeholder="Pergunte ou envie documento..." 
            style={{ 
              width: '100%', 
              padding: '0.75rem 1rem', 
              paddingRight: '70px', 
              borderRadius: '25px', 
              fontSize: '1rem',
              border: '1px solid #ccc',
              boxSizing: 'border-box', 
            }} 
          />
        
          <button 
            onClick={() => handleSendMessage()} 
            style={{ 
              position: 'absolute', 
              right: '5px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              padding: '0.5rem 0.75rem', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '25px', 
              cursor: 'pointer', 
              fontWeight: 'bold', 
              backgroundColor: PRIMARY_COLOR,
              fontSize: '0.9rem',
          
              zIndex: 2 
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