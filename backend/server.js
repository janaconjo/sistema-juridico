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
// import nodemailer from 'nodemailer'; // Nodemailer não é mais estritamente necessário

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
    origin: 'http://localhost:5173' 
}));
app.use(express.json());


// --- CONFIGURAÇÃO DO CHATBOT (GEMINI API) ---
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); 
const SYSTEM_PROMPT = `Você é um Assistente Jurídico Virtual. Sua função é analisar textos de documentos, responder a questões legais e fornecer resumos informativos. Responda de forma profissional, objetiva e use a língua portuguesa. Se o utilizador enviar um documento, comece seu resumo com "Análise do Documento:".`;


// --- CONFIGURAÇÃO DO FIREBASE ADMIN SDK ---
let db;
try {
    const serviceAccountPath = path.resolve(__dirname, 'serviceAccountKey.json');
    const serviceAccountData = fs.readFileSync(serviceAccountPath, 'utf8');
    const serviceAccount = JSON.parse(serviceAccountData);

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
    db = admin.firestore();
    console.log("✅ Firebase Admin SDK inicializado com sucesso.");
} catch (e) {
    console.error("ERRO CRÍTICO: Falha ao inicializar o Firebase Admin SDK (Requerido para Firestore).");
    console.error("Detalhes do Erro:", e.message);
}

// 🛑 ROTAS DE VERIFICAÇÃO 2FA (/api/generate-totp e /api/verify-totp) FORAM REMOVIDAS.

// ROTAS DE CHATBOT (MANTIDAS)
app.post("/chat", async (req, res) => {
    try {
        const { message } = req.body;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", 
            contents: message,
            config: {
                systemInstruction: SYSTEM_PROMPT, 
            },
        });

        res.json({
            reply: response.text,
        });
    } catch (error) {
        console.error("Erro na API do Gemini:", error);
        res.status(500).json({ error: "Erro ao obter resposta do chatbot: " + (error.message || "Erro desconhecido.") });
    }
});

app.get("/", (req, res) => {
    res.send("Servidor a funcionar ✅");
});


const PORT = 5001; 
app.listen(PORT, () => console.log(`✅ Servidor a correr em http://localhost:${PORT}`));