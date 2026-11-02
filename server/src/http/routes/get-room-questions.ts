import { desc, eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { questionSchema, roomParamsSchema } from '../schemas.js'

export const getRoomQuestionsRoute: FastifyPluginCallbackZod = (app) => {
  app.get(
    '/rooms/:roomId/questions',
    {
      schema: {
        tags: ['questions'],
        summary: 'Lista as perguntas da sala, das mais recentes primeiro',
        params: roomParamsSchema,
        response: {
          200: z.array(questionSchema),
        },
      },
    },
    async (request) => {
      const { roomId } = request.params

      return await db
        .select({
          id: schema.questions.id,
          question: schema.questions.question,
          answer: schema.questions.answer,
          createdAt: schema.questions.createdAt,
        })
        .from(schema.questions)
        .where(eq(schema.questions.roomId, roomId))
        .orderBy(desc(schema.questions.createdAt))
    }
  )
}
