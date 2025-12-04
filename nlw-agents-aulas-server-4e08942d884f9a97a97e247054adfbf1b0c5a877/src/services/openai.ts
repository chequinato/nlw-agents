import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateEmbedding(text: string) {
  const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  return response.data[0].embedding;
}

export async function generateAIResponse(question: string, context?: string) {
  const systemPrompt = `
Você é uma IA que responde de forma clara, direta e sempre com base no conteúdo fornecido na aula.
Se não tiver contexto suficiente para responder, diga que não encontrou informações relevantes.
`;

  const userPrompt = `
Pergunta do usuário: ${question}

Contexto da aula:
${context ?? "Nenhum contexto encontrado."}
`;

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.2,
  });

  return completion.choices[0].message.content || "Não consegui gerar uma resposta.";
}
