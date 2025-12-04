import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    temperature: 0.2,
    maxOutputTokens: 500,
  },
})

const embeddingModel = genAI.getGenerativeModel({
  model: "embedding-001", // embeddings compatível com v1beta
})

export async function generateEmbeddings(text: string) {
  const result = await embeddingModel.embedContent(text)
  return result.embedding.values
}

export async function generateAnswer(question: string, transcriptions: string[]) {
  try {
    const prompt =
      transcriptions.length > 0
        ? `A seguir estão trechos da aula:\n\n${transcriptions.join(
            "\n"
          )}\n\nPergunta: ${question}\nResponda:`
        : `Pergunta: ${question}`

    const result = await model.generateContent(prompt)

    return result.response.text()
  } catch (err) {
    console.error("❌ Erro ao chamar Gemini:", err)
    throw new Error("Não foi possível gerar a resposta do Gemini.")
  }
}
