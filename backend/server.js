// server.js - Módulo ES
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs'; // ⬅️ IMPORT CRÍTICO: Módulo de sistema de arquivos

// ✅ CORREÇÃO FINAL: Usa a classe correta em ESM
import { GoogleGenAI } from "@google/genai"; 

// DEPENDÊNCIAS PARA TOTP e Firebase Admin
import speakeasy from 'speakeasy';
import qrcode from 'qrcode'; 
import admin from 'firebase-admin'; 
import nodemailer from 'nodemailer'; 

dotenv.config();

// Configuração do diretório raiz para Firebase (necessário em ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
    origin: 'http://localhost:5173' 
}));
app.use(express.json());


// --- CONFIGURAÇÃO DO CHATBOT (AGORA GEMINI API) ---

// NOVO: Inicializa a classe usando o nome corrigido
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); 

// NOVO: Definição do SYSTEM_PROMPT 
const SYSTEM_PROMPT = `Você é um Assistente Jurídico Virtual. Sua função é analisar textos de documentos, responder a questões legais e fornecer resumos informativos. Responda de forma profissional, objetiva e use a língua portuguesa. Se o utilizador enviar um documento, comece seu resumo com "Análise do Documento:".`;


// --- CONFIGURAÇÃO DO FIREBASE ADMIN SDK ---
let db;
try {
    // 🛑 CORREÇÃO FINAL PARA ESM: Lê o JSON do disco
    const serviceAccountPath = path.resolve(__dirname, 'serviceAccountKey.json');
    
    // Usa o 'fs' para ler o arquivo e o JSON.parse para converter
    const serviceAccountData = fs.readFileSync(serviceAccountPath, 'utf8');
    const serviceAccount = JSON.parse(serviceAccountData);

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
    db = admin.firestore();
    console.log("✅ Firebase Admin SDK inicializado com sucesso.");
} catch (e) {
    console.error("ERRO CRÍTICO: Falha ao inicializar o Firebase Admin SDK (Requerido para 2FA).");
    console.error("Detalhes do Erro:", e.message);
    // Se o erro for ENOENT, significa que o serviceAccountKey.json não foi encontrado.
    if (e.code === 'ENOENT') {
        console.error("DICA: Certifique-se de que o arquivo 'serviceAccountKey.json' está na pasta 'backend'.");
    }
}

const getUtilizadorRef = (uid) => db ? db.collection('utilizadores').doc(uid) : null;

// --- CONFIGURAÇÃO DO TRANSPORTADOR DE E-MAIL (Ethereal para Teste) ---
let transporter;
try {
    transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, 
        auth: {
            // AS SUAS CREDENCIAIS FORNECIDAS
            user: 'akeem.schmitt@ethereal.email', 
            pass: 'fuymhSPP7J62z5AQaw'          
        }
    });
    console.log("✅ Nodemailer transporter configurado.");
} catch (e) {
    console.error("ERRO ao configurar o Nodemailer:", e.message);
}


// ----------------------------------------------------------------------
// ROTA 1: GERAÇÃO DA CHAVE SECRETA E ENVIO POR E-MAIL
// ----------------------------------------------------------------------
app.post('/api/generate-totp', async (req, res) => {
    if (!db) return res.status(500).json({ error: "Erro grave: O Firestore não está configurado. O 2FA não pode ser ativado." });

    const { email, uid } = req.body;
    
    if (!email || !uid) {
          return res.status(400).json({ error: "E-mail e UID são obrigatórios." });
    }
    
    // 1. Gera a chave secreta TOTP
    const secret = speakeasy.generateSecret({
        name: 'IPAJ - ' + email,
        length: 20
    });

    try {
        // 2. Tenta gerar QR Code URL (mantido por compatibilidade de estado)
        let qrCodeUrl = null;
        try {
            qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
        } catch (e) {
            console.warn("Aviso: Falha ao gerar o QR Code. Prosseguindo com envio por e-mail.");
        }
        
        // 3. Salva a chave secreta no perfil do utilizador
        await getUtilizadorRef(uid).update({
            totpSecret: secret.base32,
            verificado: false
        });

        // 4. ENVIA A CHAVE SECRETA POR E-MAIL
        if (transporter) {
            let info = await transporter.sendMail({
                from: '"IPAJ Suporte" <suporte@ipaj.mz>', 
                to: email, 
                subject: "Configuração da Autenticação de 2 Fatores (2FA)", 
                html: `
                    <h2>Configuração da Autenticação de 2 Fatores (2FA) - IPAJ</h2>
                    <p>Olá,</p>
                    <p>O seu registo foi concluído. Para ativar a segurança de 2 Fatores, utilize a chave de segurança abaixo.</p>
                    <p><strong>A sua Chave Secreta TOTP (Base32):</strong></p>
                    <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; text-align: center;">
                        <code style="font-size: 18px; font-weight: bold; color: #333; user-select: all;">${secret.base32}</code>
                    </div>
                    <p>Abra o seu aplicativo autenticador (Google Authenticator ou Authy), selecione 'Introduzir Chave de Configuração' e cole a chave acima.</p>
                    <p>O seu nome de conta deve ser: <strong>${email}</strong></p>
                    <p>Depois, use o código de 6 dígitos gerado para verificar a sua conta no site.</p>
                `, 
            });

            console.log("✅ Mensagem enviada: %s", info.messageId);
            // CRÍTICO: Link de pré-visualização no terminal
            console.log("   URL da Pré-visualização (Ethereal): %s", nodemailer.getTestMessageUrl(info));
        }
        
        // 5. Retorna o sucesso e a chave para fallback/exibição
        res.json({
            qrCodeUrl: qrCodeUrl, 
            secret: secret.base32 
        });

    } catch (err) {
        console.error("ERRO no /api/generate-totp (Geração/Email):", err.message);
        res.status(500).json({ 
            error: "Falha na geração da chave ou envio do e-mail de 2FA. Verifique as credenciais do Nodemailer/Ethereal." 
        });
    }
});


// ROTA 2: VERIFICAÇÃO DO CÓDIGO TOTP
app.post('/api/verify-totp', async (req, res) => {
    if (!db) return res.status(500).json({ error: "O Firestore não está configurado corretamente." });

    const { uid, code } = req.body;

    if (!uid || !code || code.length !== 6) {
        return res.status(400).json({ error: "UID e código de 6 dígitos são obrigatórios." });
    }

    try {
        const userDoc = await getUtilizadorRef(uid).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: "Utilizador não encontrado." });
        }
        const { totpSecret } = userDoc.data();

        const verified = speakeasy.totp.verify({
            secret: totpSecret,
            encoding: 'base32',
            token: code,
            window: 1
        });

        if (verified) {
            await getUtilizadorRef(uid).update({
                verificado: true 
            });
            return res.json({ success: true, message: "Verificação concluída. Conta ativada." });
        } else {
            return res.status(400).json({ success: false, error: "Código de verificação inválido. Tente novamente." });
        }
    } catch (err) {
          console.error("Erro no /api/verify-totp:", err);
          res.status(500).json({ error: "Erro interno do servidor durante a verificação." });
    }
});

// ROTAS DE CHATBOT (ATUALIZADAS PARA GEMINI)
app.post("/chat", async (req, res) => {
    try {
        const { message } = req.body;

        // O SDK do Gemini usa o método `generateContent` diretamente.
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", // Modelo rápido e gratuito
            contents: message,
            config: {
                // Adiciona a instrução do sistema para o contexto jurídico
                systemInstruction: SYSTEM_PROMPT, 
            },
        });

        res.json({
            // A resposta é obtida através da propriedade 'text'
            reply: response.text,
        });
    } catch (error) {
        console.error("Erro na API do Gemini:", error);
        // Inclui a mensagem de erro da API para diagnóstico
        res.status(500).json({ error: "Erro ao obter resposta do chatbot: " + (error.message || "Erro desconhecido.") });
    }
});

app.get("/", (req, res) => {
    res.send("Servidor a funcionar ✅");
});


const PORT = 5001; 
app.listen(PORT, () => console.log(`✅ Servidor a correr em http://localhost:${PORT}`));