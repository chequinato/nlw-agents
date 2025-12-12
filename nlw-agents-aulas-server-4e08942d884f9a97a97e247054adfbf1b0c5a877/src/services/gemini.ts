import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.2,
    maxOutputTokens: 2000,
  },
})

const embeddingModel = genAI.getGenerativeModel({
  model: "embedding-001",
})

export async function generateEmbeddings(text: string) {
  const result = await embeddingModel.embedContent(text)
  return result.embedding.values
}

/**
 * Agora, todos os trechos de áudio são enviados juntos numa única requisição
 */
export async function generateAnswer(question: string, transcriptions: string[]) {
  try {
    // Junta todos os trechos em um único prompt
    const combinedText = transcriptions.join("\n")

    const prompt =
      combinedText.length > 0
        ? `A seguir estão trechos da aula:\n\n${combinedText}\n\nPergunta: ${question}\nResponda:`
        : `Pergunta: ${question}`

    // Chama Gemini apenas uma vez
    const result = await model.generateContent(prompt)

    return result.response.text()
  } catch (err) {
    console.error("❌ Erro ao chamar Gemini:", err)
    throw new Error("Não foi possível gerar a resposta do Gemini.")
  }
}
