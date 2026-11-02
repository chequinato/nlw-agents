import { eq } from 'drizzle-orm'
import { z } from 'zod/v4'
import { db } from '../db/connection.js'
import { schema } from '../db/schema/index.js'
import { NotFoundError } from './errors.js'

// Schemas compartilhados entre as rotas (validação + documentação no Swagger)

export const roomParamsSchema = z.object({
  roomId: z.uuid({ error: 'roomId precisa ser um UUID válido.' }),
})

export const errorResponseSchema = z.object({
  message: z.string(),
  issues: z
    .array(z.object({ field: z.string(), message: z.string() }))
    .optional(),
})

export const roomSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.date(),
  questionsCount: z.number(),
  audioChunksCount: z.number(),
})

export const questionSchema = z.object({
  id: z.uuid(),
  question: z.string(),
  answer: z.string().nullable(),
  createdAt: z.date(),
})

export const transcriptionSchema = z.object({
  id: z.uuid(),
  transcription: z.string(),
  createdAt: z.date(),
})

/** Garante que a sala existe antes de gravar algo nela. */
export async function assertRoomExists(roomId: string) {
  const [room] = await db
    .select({ id: schema.rooms.id })
    .from(schema.rooms)
    .where(eq(schema.rooms.id, roomId))
    .limit(1)

  if (!room) {
    throw new NotFoundError('Sala não encontrada.')
  }
}
