import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Rota principal do chatbot
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message }],
    });

    res.json({
      reply: response.choices[0].message.content,
    });
  } catch (error) {
    console.error("Erro na API:", error);
    res.status(500).json({ error: "Erro ao obter resposta do chatbot." });
  }
});
app.get("/", (req, res) => {
  res.send("Servidor a funcionar ✅");
});


const PORT = 5001;
app.listen(PORT, () => console.log(`✅ Servidor a correr em http://localhost:${PORT}`));
