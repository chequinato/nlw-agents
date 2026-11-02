import { randomUUID } from 'node:crypto'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import type { FastifyBaseLogger } from 'fastify'
import { env } from '../env.js'
import {
  generateAnswer as generateGeminiAnswer,
  transcribeAudio as transcribeWithGemini,
} from './gemini.js'
import {
  generateAnswer as generateOpenAIAnswer,
  isOpenAIConfigured,
} from './openai.js'
import { transcribeAudioFile } from './whisper-local.js'

export type AIProvider = 'gemini' | 'openai'

export class AIUnavailableError extends Error {
  constructor() {
    super('Nenhum provedor de IA conseguiu responder no momento.')
  }
}

/**
 * Gera a resposta com o Gemini e, se ele falhar e a OpenAI estiver
 * configurada, tenta de novo com a OpenAI.
 */
export async function answerQuestion(
  question: string,
  contextChunks: string[],
  log: FastifyBaseLogger
): Promise<{ answer: string; provider: AIProvider }> {
  try {
    const answer = await generateGeminiAnswer(question, contextChunks)
    return { answer, provider: 'gemini' }
  } catch (geminiError) {
    log.warn({ err: geminiError }, 'Gemini falhou ao responder')

    if (!isOpenAIConfigured()) {
      throw new AIUnavailableError()
    }
  }

  try {
    const answer = await generateOpenAIAnswer(question, contextChunks)
    return { answer, provider: 'openai' }
  } catch (openaiError) {
    log.error({ err: openaiError }, 'OpenAI também falhou ao responder')
    throw new AIUnavailableError()
  }
}

export async function transcribe(audio: Buffer, mimeType: string) {
  if (env.TRANSCRIPTION_PROVIDER === 'gemini') {
    return transcribeWithGemini(audio, mimeType)
  }

  // O Whisper lê de arquivo, então o buffer vai para uma pasta temporária
  const dir = path.join(tmpdir(), 'nlw-agents')
  await mkdir(dir, { recursive: true })

  const extension = mimeType.split('/')[1]?.split(';')[0] ?? 'webm'
  const filePath = path.join(dir, `${randomUUID()}.${extension}`)

  await writeFile(filePath, audio)

  try {
    return await transcribeAudioFile(filePath)
  } finally {
    await rm(filePath, { force: true })
  }
}
