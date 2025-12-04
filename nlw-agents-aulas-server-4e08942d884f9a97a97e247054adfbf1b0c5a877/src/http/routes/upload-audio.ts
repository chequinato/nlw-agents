// src/http/routes/upload-audio.ts
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import fs from 'fs'
import path from 'path'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/schema/index.ts'
import { eq, asc } from 'drizzle-orm'
import { transcribeAudio } from '../../services/whisper_local.ts'
import { generateAnswer } from '../../services/gemini.ts'

export const uploadAudioRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/rooms/:roomId/audio',
    {
      schema: {
        params: z.object({ roomId: z.string() }),
      },
    },
    async (request, reply) => {
      const { roomId } = request.params
      const audio = await request.file()

      if (!audio) throw new Error('Audio is required.')

      const tmpDir = path.resolve('./tmp')
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)

      const tempPath = path.join(tmpDir, `${Date.now()}-${audio.filename}`)
      await audio
        .toBuffer()
        .then((buffer) => fs.promises.writeFile(tempPath, buffer))

      try {
        const transcription = await transcribeAudio(tempPath)
        let aiResponse = ''
        
        // Usa apenas Gemini para evitar quota da OpenAI
        try {
          const previousTranscriptions = await db
            .select()
            .from(schema.audioChunks)
            .where(eq(schema.audioChunks.roomId, roomId))
            .orderBy(asc(schema.audioChunks.createdAt))
            .then((rows) => rows.map((r) => r.transcription))

          aiResponse = await generateAnswer(
            transcription,
            previousTranscriptions
          )
        } catch (geminiError) {
          console.error('❌ Gemini falhou:', geminiError)
          aiResponse = 'Desculpe, não consegui processar sua pergunta no momento. Tente novamente mais tarde.'
        }

        // Embeddings padrão (sem usar Gemini embeddings por enquanto)
        const embeddings = Array(768).fill(0)

        const result = await db
          .insert(schema.audioChunks)
          .values({
            roomId,
            transcription,
            embeddings,
          })
          .returning()

        const chunk = result[0]
        if (!chunk) throw new Error('Erro ao salvar chunk de áudio')

        return reply.status(201).send({
          chunkId: chunk.id,
          transcription,
          aiResponse,
        })
      } finally {
        fs.promises.unlink(tempPath).catch(() => null)
      }
    }
  )
}
