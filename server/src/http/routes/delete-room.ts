import { eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { NotFoundError } from '../errors.js'
import { errorResponseSchema, roomParamsSchema } from '../schemas.js'

export const deleteRoomRoute: FastifyPluginCallbackZod = (app) => {
  app.delete(
    '/rooms/:roomId',
    {
      schema: {
        tags: ['rooms'],
        summary: 'Remove a sala com perguntas e transcrições',
        params: roomParamsSchema,
        response: {
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { roomId } = request.params

      // Perguntas e trechos de áudio saem junto pelo ON DELETE CASCADE
      const deleted = await db
        .delete(schema.rooms)
        .where(eq(schema.rooms.id, roomId))
        .returning({ id: schema.rooms.id })

      if (deleted.length === 0) {
        throw new NotFoundError('Sala não encontrada.')
      }

      return reply.status(204).send()
    }
  )
}
