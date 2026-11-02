import { eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { schema } from '../../db/schema/index.js'
import { NotFoundError } from '../errors.js'
import {
  errorResponseSchema,
  roomParamsSchema,
  roomSchema,
} from '../schemas.js'
import { selectRooms } from './get-rooms.js'

export const getRoomRoute: FastifyPluginCallbackZod = (app) => {
  app.get(
    '/rooms/:roomId',
    {
      schema: {
        tags: ['rooms'],
        summary: 'Detalhes de uma sala',
        params: roomParamsSchema,
        response: {
          200: roomSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request) => {
      const { roomId } = request.params

      const [room] = await selectRooms()
        .where(eq(schema.rooms.id, roomId))
        .limit(1)

      if (!room) {
        throw new NotFoundError('Sala não encontrada.')
      }

      return room
    }
  )
}
