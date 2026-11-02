import { asc, eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { generateSummary } from '../../services/gemini.js'
import { BadRequestError, ServiceUnavailableError } from '../errors.js'
import {
  assertRoomExists,
  errorResponseSchema,
  roomParamsSchema,
} from '../schemas.js'

export const createRoomSummaryRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/rooms/:roomId/summary',
    {
      schema: {
        tags: ['audio'],
        summary: 'Gera um resumo de estudo a partir de tudo que foi gravado',
        params: roomParamsSchema,
        response: {
          200: z.object({
            summary: z.string(),
            chunks: z.number(),
          }),
          400: errorResponseSchema,
          404: errorResponseSchema,
          503: errorResponseSchema,
        },
      },
    },
    async (request) => {
      const { roomId } = request.params

      await assertRoomExists(roomId)

      const chunks = await db
        .select({ transcription: schema.audioChunks.transcription })
        .from(schema.audioChunks)
        .where(eq(schema.audioChunks.roomId, roomId))
        .orderBy(asc(schema.audioChunks.createdAt))

      if (chunks.length === 0) {
        throw new BadRequestError(
          'Esta sala ainda não tem gravações para resumir.'
        )
      }

      try {
        const summary = await generateSummary(
          chunks.map((chunk) => chunk.transcription)
        )

        return { summary, chunks: chunks.length }
      } catch (error) {
        request.log.error({ err: error }, 'Falha ao gerar o resumo')
        throw new ServiceUnavailableError(
          'Não foi possível gerar o resumo agora. Tente novamente.'
        )
      }
    }
  )
}
