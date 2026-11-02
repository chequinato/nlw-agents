import { GoogleGenAI } from '@google/genai'
import { env } from '../env.js'
import {
  ANSWER_SYSTEM_PROMPT,
  buildAnswerPrompt,
  buildSummaryPrompt,
  SUMMARY_SYSTEM_PROMPT,
  TRANSCRIPTION_PROMPT,
} from './prompts.js'
import { normalizeVector } from './vector.js'

// Precisa bater com a coluna vector(768) de audio_chunks
export const EMBEDDING_DIMENSIONS = 768

const gemini = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY })

export type EmbeddingTask = 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY'

export async function transcribeAudio(audio: Buffer, mimeType: string) {
  const response = await gemini.models.generateContent({
    model: env.GEMINI_MODEL,
    contents: [
      { text: TRANSCRIPTION_PROMPT },
      { inlineData: { mimeType, data: audio.toString('base64') } },
    ],
    config: { temperature: 0 },
  })

  return response.text?.trim() ?? ''
}

export async function generateEmbeddings(
  text: string,
  taskType: EmbeddingTask
) {
  const response = await gemini.models.embedContent({
    model: env.GEMINI_EMBEDDING_MODEL,
    contents: [{ text }],
    config: { taskType, outputDimensionality: EMBEDDING_DIMENSIONS },
  })

  const values = response.embeddings?.[0]?.values

  if (!values || values.length !== EMBEDDING_DIMENSIONS) {
    throw new Error('O Gemini não retornou embeddings válidos.')
  }

  // Abaixo de 3072 dimensões o gemini-embedding-001 não normaliza o vetor
  return normalizeVector(values)
}

export async function generateAnswer(
  question: string,
  contextChunks: string[]
) {
  const response = await gemini.models.generateContent({
    model: env.GEMINI_MODEL,
    contents: buildAnswerPrompt(question, contextChunks),
    config: {
      systemInstruction: ANSWER_SYSTEM_PROMPT,
      temperature: 0.2,
    },
  })

  const answer = response.text?.trim()

  if (!answer) {
    throw new Error('O Gemini retornou uma resposta vazia.')
  }

  return answer
}

export async function generateSummary(transcriptions: string[]) {
  const response = await gemini.models.generateContent({
    model: env.GEMINI_MODEL,
    contents: buildSummaryPrompt(transcriptions),
    config: {
      systemInstruction: SUMMARY_SYSTEM_PROMPT,
      temperature: 0.3,
    },
  })

  const summary = response.text?.trim()

  if (!summary) {
    throw new Error('O Gemini retornou um resumo vazio.')
  }

  return summary
}
