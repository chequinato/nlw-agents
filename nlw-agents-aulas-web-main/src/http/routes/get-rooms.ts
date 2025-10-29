import { eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { db } from '../../db/connection.ts'
import { rooms, questions } from '../../db/schema/index.ts'
import { sql } from 'drizzle-orm/sql'

export const getRoomsRoute: FastifyPluginCallbackZod = (app) => {
  app.get('/rooms', async () => {
    try {
      const results = await db
        .select({
          id: rooms.id,
          name: rooms.name,
          createdAt: rooms.createdAt,
          questionsCount: sql`COALESCE(COUNT(${questions.id}), 0)`.as('questionsCount'),
        })
        .from(rooms)
        .leftJoin(questions, eq(questions.roomId, rooms.id))
        .groupBy(rooms.id)
        .orderBy(rooms.createdAt)

      return results
    } catch (err) {
      console.error('Erro ao buscar rooms:', err)
      return app.internalServerError()
    }
  })
}
