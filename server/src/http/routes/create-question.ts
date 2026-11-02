import { and, asc, cosineDistance, desc, eq, lt } from 'drizzle-orm'
import type { FastifyBaseLogger } from 'fastify'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { AIUnavailableError, answerQuestion } from '../../services/ai.js'
import { generateEmbeddings } from '../../services/gemini.js'
import { ServiceUnavailableError } from '../errors.js'
import {
  assertRoomExists,
  errorResponseSchema,
  roomParamsSchema,
} from '../schemas.js'

// Quantos trechos entram no prompt e a similaridade mínima para entrar
const MAX_CONTEXT_CHUNKS = 5
const MIN_SIMILARITY = 0.5

/**
 * Busca os trechos da aula mais parecidos com a pergunta (RAG).
 * Se o embedding da pergunta falhar, usa os trechos mais recentes da sala.
 */
async function findRelevantChunks(
  roomId: string,
  question: string,
  log: FastifyBaseLogger
) {
  try {
    const questionEmbeddings = await generateEmbeddings(
      question,
      'RETRIEVAL_QUERY'
    )

    const distance = cosineDistance(
      schema.audioChunks.embeddings,
      questionEmbeddings
    )

    // Comparar a distância (e não a similaridade) deixa de fora vetores
    // zerados: para eles o pgvector devolve NaN, e NaN < x é falso
    const chunks = await db
      .select({ transcription: schema.audioChunks.transcription })
      .from(schema.audioChunks)
      .where(
        and(
          eq(schema.audioChunks.roomId, roomId),
          lt(distance, 1 - MIN_SIMILARITY)
        )
      )
      .orderBy(asc(distance))
      .limit(MAX_CONTEXT_CHUNKS)

    return chunks.map((chunk) => chunk.transcription)
  } catch (error) {
    log.warn({ err: error }, 'Busca semântica falhou, usando trechos recentes')

    const chunks = await db
      .select({ transcription: schema.audioChunks.transcription })
      .from(schema.audioChunks)
      .where(eq(schema.audioChunks.roomId, roomId))
      .orderBy(desc(schema.audioChunks.createdAt))
      .limit(MAX_CONTEXT_CHUNKS)

    return chunks.map((chunk) => chunk.transcription).reverse()
  }
}

export const createQuestionRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/rooms/:roomId/questions',
    {
      schema: {
        tags: ['questions'],
        summary: 'Faz uma pergunta e responde com base nas gravações da sala',
        params: roomParamsSchema,
        body: z.object({
          question: z.string().trim().min(3).max(1000),
        }),
        response: {
          201: z.object({
            questionId: z.uuid(),
            answer: z.string(),
            provider: z.enum(['gemini', 'openai']),
            contextChunks: z.number(),
          }),
          404: errorResponseSchema,
          503: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { roomId } = request.params
      const { question } = request.body

      await assertRoomExists(roomId)

      const contextChunks = await findRelevantChunks(
        roomId,
        question,
        request.log
      )

      let result: Awaited<ReturnType<typeof answerQuestion>>

      try {
        result = await answerQuestion(question, contextChunks, request.log)
      } catch (error) {
        if (error instanceof AIUnavailableError) {
          throw new ServiceUnavailableError(error.message)
        }
        throw error
      }

      const [saved] = await db
        .insert(schema.questions)
        .values({ roomId, question, answer: result.answer })
        .returning({ id: schema.questions.id })

      if (!saved) {
        throw new Error('Falha ao salvar a pergunta.')
      }

      return reply.status(201).send({
        questionId: saved.id,
        answer: result.answer,
        provider: result.provider,
        contextChunks: contextChunks.length,
      })
    }
  )
}
