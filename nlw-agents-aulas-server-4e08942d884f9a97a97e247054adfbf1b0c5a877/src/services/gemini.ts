import OpenAI from "openai";
import { env } from "../env.ts";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export async function transcribeAudio(audioAsBase64: string, mimeType: string) {
  const response = await openai.audio.transcriptions.create({
    file: Buffer.from(audioAsBase64, "base64"),
    model: "whisper-1",
  });

  if (!response.text) {
    throw new Error("Não foi possível converter o áudio");
  }

  return response.text;
}

export async function generateEmbeddings(text: string) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  if (!response.data?.[0].embedding) {
    throw new Error("Não foi possível gerar os embeddings.");
  }

  return response.data[0].embedding;
}

export async function generateAnswer(question: string, transcriptions: string[]) {
  const context = transcriptions.join("\n\n");

  const prompt = `
Com base no texto fornecido abaixo como contexto, responda a pergunta de forma clara e precisa em português do Brasil.

CONTEXTO:
${context}

PERGUNTA:
${question}

INSTRUÇÕES:
- Use apenas informações contidas no contexto enviado;
- Se a resposta não for encontrada no contexto, apenas responda que não possui informações suficientes para responder;
- Seja objetivo;
- Mantenha um tom educativo e profissional;
- Cite trechos relevantes do contexto se apropriado;
- Se for citar o contexto, utilize o termo "conteúdo da aula".
  `.trim();

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  if (!response.choices?.[0].message?.content) {
    throw new Error("Falha ao gerar resposta pelo OpenAI");
  }

  return response.choices[0].message.content;
}
