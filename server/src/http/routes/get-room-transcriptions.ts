import { asc, eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { roomParamsSchema, transcriptionSchema } from '../schemas.js'

export const getRoomTranscriptionsRoute: FastifyPluginCallbackZod = (app) => {
  app.get(
    '/rooms/:roomId/transcriptions',
    {
      schema: {
        tags: ['audio'],
        summary: 'Transcrição da sala, na ordem em que foi gravada',
        params: roomParamsSchema,
        response: {
          200: z.array(transcriptionSchema),
        },
      },
    },
    async (request) => {
      const { roomId } = request.params

      return await db
        .select({
          id: schema.audioChunks.id,
          transcription: schema.audioChunks.transcription,
          createdAt: schema.audioChunks.createdAt,
        })
        .from(schema.audioChunks)
        .where(eq(schema.audioChunks.roomId, roomId))
        .orderBy(asc(schema.audioChunks.createdAt))
    }
  )
}
