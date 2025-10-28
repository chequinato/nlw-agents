import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../env.ts";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export async function generateEmbeddings(text: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text);

    if (!result.embedding?.values) throw new Error("Embedding não retornado pela API Gemini");

    return result.embedding.values;
  } catch (err) {
    console.error("Erro ao gerar embeddings:", err);
    throw new Error("Não foi possível gerar os embeddings.");
  }
}

export async function generateAnswer(question: string, transcriptions: string[]) {
  try {
    const context = transcriptions.join("\n\n");

    const prompt = `
Baseado no conteúdo da aula abaixo, responda em português do Brasil.

CONTEÚDO DA AULA:
${context}

PERGUNTA:
${question}

Regras:
- Só use informações do conteúdo da aula.
- Se não souber, diga que não há informação suficiente.
- Seja claro e objetivo.
- Use tom educativo e direto.
`.trim();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const response = await model.generateContent(prompt);
    const text = response.response.text();

    return text;
  } catch (err) {
    console.error("Erro ao gerar resposta:", err);
    throw new Error("Falha ao gerar resposta com Gemini");
  }
}
