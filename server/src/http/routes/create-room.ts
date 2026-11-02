import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'

export const createRoomRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/rooms',
    {
      schema: {
        tags: ['rooms'],
        summary: 'Cria uma sala',
        body: z.object({
          name: z.string().trim().min(3).max(120),
          description: z.string().trim().max(1000).optional(),
        }),
        response: {
          201: z.object({ roomId: z.uuid() }),
        },
      },
    },
    async (request, reply) => {
      const { name, description } = request.body

      const [room] = await db
        .insert(schema.rooms)
        .values({
          name,
          // String vazia vira null para o front tratar "sem descrição" de um jeito só
          description: description || null,
        })
        .returning({ id: schema.rooms.id })

      if (!room) {
        throw new Error('Falha ao criar a sala.')
      }

      return reply.status(201).send({ roomId: room.id })
    }
  )
}
