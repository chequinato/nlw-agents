import { and, eq, sql } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/schema/index.ts'
import { generateAnswer, generateEmbeddings } from '../../services/gemini.ts'

// Set para controlar salas que já estão gerando resposta
const generatingQuestions = new Set<string>()

export const createQuestionRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/rooms/:roomId/questions',
    {
      schema: {
        params: z.object({
          roomId: z.string(),
        }),
        body: z.object({
          question: z.string().min(1),
        }),
      },
    },
    async (request, reply) => {
      const { roomId } = request.params
      const { question } = request.body

      // Bloqueia múltiplas perguntas simultâneas pra mesma sala
      if (generatingQuestions.has(roomId)) {
        return reply
          .status(429)
          .send({ message: 'Ainda gerando resposta para esta sala' })
      }

      generatingQuestions.add(roomId)

      try {
        // Gera embeddings da pergunta
        const embeddings = await generateEmbeddings(question)
        const embeddingsAsString = `[${embeddings.join(',')}]`

        // Busca chunks relevantes
        const chunks = await db
          .select({
            id: schema.audioChunks.id,
            transcription: schema.audioChunks.transcription,
            similarity: sql<number>`1 - (${schema.audioChunks.embeddings} <=> ${embeddingsAsString}::vector)`,
          })
          .from(schema.audioChunks)
          .where(
            and(
              eq(schema.audioChunks.roomId, roomId),
              sql`1 - (${schema.audioChunks.embeddings} <=> ${embeddingsAsString}::vector) > 0.7`
            )
          )
          .orderBy(
            sql`${schema.audioChunks.embeddings} <=> ${embeddingsAsString}::vector`
          )
          .limit(3)

        let answer: string | null = null

        if (chunks.length > 0) {
          const transcriptions = chunks.map((chunk) => chunk.transcription)
          answer = await generateAnswer(question, transcriptions)
        }

        // Insere pergunta + resposta no banco
        const result = await db
          .insert(schema.questions)
          .values({ roomId, question, answer })
          .returning()

        const insertedQuestion = result[0]

        if (!insertedQuestion) {
          throw new Error('Falha ao criar nova pergunta.')
        }

        return reply.status(201).send({
          questionId: insertedQuestion.id,
          answer,
        })
      } catch (err) {
        console.error(err)
        return reply.status(500).send({ message: 'Erro ao criar pergunta' })
      } finally {
        // Libera a sala do bloqueio
        generatingQuestions.delete(roomId)
      }
    }
  )
}
