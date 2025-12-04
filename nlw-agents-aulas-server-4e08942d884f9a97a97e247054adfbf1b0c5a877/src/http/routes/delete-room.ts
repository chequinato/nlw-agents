import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '../../db/connection'
import { schema } from '../../db/schema/index'

export async function deleteRoom(app: FastifyInstance) {
  app.delete('/rooms/:roomId', async (request, reply) => {
    const paramsSchema = z.object({
      roomId: z.string().uuid(),
    })

    const { roomId } = paramsSchema.parse(request.params)

    try {
      // Deleta todas as perguntas da sala
      await db
        .delete(schema.questions)
        .where(eq(schema.questions.roomId, roomId))

      // Deleta todos os chunks de áudio da sala
      await db
        .delete(schema.audioChunks)
        .where(eq(schema.audioChunks.roomId, roomId))

      // Deleta a sala
      await db.delete(schema.rooms).where(eq(schema.rooms.id, roomId))

      return reply.status(200).send({
        success: true,
        message: 'Sala deletada com sucesso',
      })
    } catch (error) {
      console.error('Erro ao deletar sala:', error)
      return reply.status(500).send({
        error: 'Erro ao deletar sala.',
      })
    }
  })
}
