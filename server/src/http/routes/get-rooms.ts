import { desc, eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { roomSchema } from '../schemas.js'

// Contagens como subconsultas: dois LEFT JOIN multiplicariam as linhas
export function selectRooms() {
  return db
    .select({
      id: schema.rooms.id,
      name: schema.rooms.name,
      description: schema.rooms.description,
      createdAt: schema.rooms.createdAt,
      questionsCount: db.$count(
        schema.questions,
        eq(schema.questions.roomId, schema.rooms.id)
      ),
      audioChunksCount: db.$count(
        schema.audioChunks,
        eq(schema.audioChunks.roomId, schema.rooms.id)
      ),
    })
    .from(schema.rooms)
}

export const getRoomsRoute: FastifyPluginCallbackZod = (app) => {
  app.get(
    '/rooms',
    {
      schema: {
        tags: ['rooms'],
        summary: 'Lista as salas, das mais recentes para as mais antigas',
        response: {
          200: z.array(roomSchema),
        },
      },
    },
    async () => {
      return await selectRooms().orderBy(desc(schema.rooms.createdAt))
    }
  )
}
