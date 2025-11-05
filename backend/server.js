// server.js (Código Node.js/Express)
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs'; 

// Dependências mantidas
import { GoogleGenAI } from "@google/genai"; 
import admin from 'firebase-admin'; 

dotenv.config();

// Configurações de diretório para módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- CONFIGURAÇÃO DE MIDDLEWARE ---
app.use(cors({
    origin: 'http://localhost:5173' // Garante que o frontend React (Vite) pode conectar
}));
app.use(express.json());


// --- CONFIGURAÇÃO DO CHATBOT (GEMINI API) ---
// Certifique-se de que GEMINI_API_KEY está no seu arquivo .env
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); 
const SYSTEM_PROMPT = `Você é um Assistente Jurídico Virtual. Sua função é analisar textos de documentos, responder a questões legais e fornecer resumos informativos. Responda de forma profissional, objetiva e use a língua portuguesa. Se você identificar que o usuário enviou um documento (contexto) seguido de uma pergunta, comece sua resposta com "Análise do Documento:" antes de responder à pergunta.`;


// --- CONFIGURAÇÃO DO FIREBASE ADMIN SDK (Firestore) ---
let db;
try {
    const serviceAccountPath = path.resolve(__dirname, 'serviceAccountKey.json');
    // Verifica se o arquivo serviceAccountKey.json existe
    if (fs.existsSync(serviceAccountPath)) {
        const serviceAccountData = fs.readFileSync(serviceAccountPath, 'utf8');
        const serviceAccount = JSON.parse(serviceAccountData);

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        db = admin.firestore();
        console.log("✅ Firebase Admin SDK inicializado com sucesso.");
    } else {
        console.warn("AVISO: serviceAccountKey.json não encontrado. Firestore não será inicializado.");
    }
} catch (e) {
    console.error("ERRO CRÍTICO: Falha ao inicializar o Firebase Admin SDK (Pode ser por erro de parsing do JSON).");
    console.error("Detalhes do Erro:", e.message);
}


// --- ROTAS DE CHATBOT ---
app.post("/chat", async (req, res) => {
    try {
        const { message } = req.body;
        
        const DOCUMENT_DELIMITER = 'DOCUMENTO PARA ANÁLISE: """';
        
        let geminiContents;

        if (message.includes(DOCUMENT_DELIMITER)) {
            // Lógica para estruturar o prompt quando há um documento
            const docStart = message.indexOf(DOCUMENT_DELIMITER) + DOCUMENT_DELIMITER.length;
            const docEnd = message.indexOf('""" PERGUNTA JURÍDICA:');
            
            const documentText = message.substring(docStart, docEnd).trim();
            // Adiciona uma pequena verificação para o caso do delimitador não estar exatamente onde esperado
            const questionStartIndex = message.indexOf('PERGUNTA JURÍDICA:', docEnd);
            const userQuestion = questionStartIndex !== -1 
                                ? message.substring(questionStartIndex + 'PERGUNTA JURÍDICA:'.length).trim()
                                : "Por favor, resuma o documento e identifique as partes principais.";
            
            // Estrutura o prompt de forma clara, usando tags para o Gemini
            // Isso ajuda o modelo a diferenciar o contexto da instrução
            const structuredPrompt = `
                <DOCUMENTO_CONTEXTO>
                ${documentText}
                </DOCUMENTO_CONTEXTO>
                
                <PERGUNTA_USUARIO>
                ${userQuestion}
                </PERGUNTA_USUARIO>
                
                Com base no DOCUMENTO_CONTEXTO, responda de forma profissional à PERGUNTA_USUARIO.
            `;

            geminiContents = structuredPrompt;
            
            console.log(`Processando Documento de ${documentText.length} chars. Pergunta: ${userQuestion.substring(0, 50)}...`);
            
        } else {
            // Se for uma mensagem normal, enviamos diretamente
            geminiContents = message;
            console.log(`Processando Mensagem normal: ${message.substring(0, 50)}...`);
        }
        
        // Chamada à API do Gemini
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", 
            contents: geminiContents, 
            config: {
                systemInstruction: SYSTEM_PROMPT, 
            },
        });

        // 💡 Opcional: Salvar no Firestore
        if (db) {
            await db.collection('chat_logs').add({
                userMessage: message,
                botReply: response.text,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                hasDocument: message.includes(DOCUMENT_DELIMITER)
            });
        }

        res.json({
            reply: response.text,
        });

    } catch (error) {
        console.error("Erro na API do Gemini ou no servidor:", error);
        res.status(500).json({ error: "Erro ao obter resposta do chatbot: " + (error.message || "Erro desconhecido.") });
    }
});


// --- ROTA DE STATUS ---
app.get("/", (req, res) => {
    res.send("Servidor a funcionar ✅. Chatbot API pronto na porta 5001.");
});


// --- INICIALIZAÇÃO DO SERVIDOR ---
const PORT = 5001; 
app.listen(PORT, () => console.log(`✅ Servidor a correr em http://localhost:${PORT}`));