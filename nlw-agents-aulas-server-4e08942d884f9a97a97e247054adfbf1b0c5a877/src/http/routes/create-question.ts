import { and, eq, sql } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/schema/index.ts'
import { generateAnswer, generateEmbeddings } from '../../services/gemini.ts'

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

      if (generatingQuestions.has(roomId)) {
        return reply
          .status(429)
          .send({ message: 'Ainda gerando resposta para esta sala' })
      }

      generatingQuestions.add(roomId)

      try {
        // 🔹 Salva a pergunta primeiro (sem resposta ainda)
        const [insertedQuestion] = await db
          .insert(schema.questions)
          .values({ roomId, question, answer: null })
          .returning()

        // 🔹 Manda resposta imediata pro front (pra mostrar o "gerando resposta da IA")
        reply.status(201).send({
          questionId: insertedQuestion.id,
          answer: null,
        })

        // 🔹 Agora gera embeddings e resposta da IA de forma assíncrona
        const embeddings = await generateEmbeddings(question)
        const embeddingsAsString = `[${embeddings.join(',')}]`

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
        } else {
          answer = 'Não encontrei informações relevantes no conteúdo da aula.'
        }

        // 🔹 Atualiza a pergunta com a resposta gerada
        await db
          .update(schema.questions)
          .set({ answer })
          .where(eq(schema.questions.id, insertedQuestion.id))

        console.log(`✅ Resposta gerada para pergunta ${insertedQuestion.id}`)
      } catch (err) {
        console.error('❌ Erro ao gerar resposta:', err)
      } finally {
        generatingQuestions.delete(roomId)
      }
    }
  )
}
