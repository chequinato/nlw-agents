import { GoogleGenAI } from "@google/genai";
import { env } from "../env.ts";

// Inicializa o cliente
const client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

// === EMBEDDINGS ===
export async function generateEmbeddings(text: string) {
  try {
    const model = client.models.get("textembedding-gecko-001");
    const result = await model.embed({ text });

    if (!result.embedding?.values) {
      throw new Error("Embedding não retornado pela API Gemini");
    }

    return result.embedding.values;
  } catch (err) {
    console.error("❌ Erro ao gerar embeddings:", err);
    throw new Error("Não foi possível gerar os embeddings.");
  }
}

// === GERA RESPOSTA ===
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

    const model = client.models.get("gemini-1.5-turbo");
    const response = await model.generateContent({ text: prompt });

    return response.output_text ?? "";
  } catch (err) {
    console.error("❌ Erro ao gerar resposta:", err);
    throw new Error("Falha ao gerar resposta com Gemini.");
  }
}
