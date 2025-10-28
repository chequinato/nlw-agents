import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import fs from 'fs'
import path from 'path'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/schema/index.ts'
import { transcribeAudio } from '../../services/whisper_local.ts'
import { generateEmbeddings, generateAnswer } from '../../services/gemini.ts'

export const uploadAudioRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/rooms/:roomId/audio',
    {
      schema: {
        params: z.object({ roomId: z.string() }),
        body: z.any(),
      },
    },
    async (request, reply) => {
      const { roomId } = request.params
      const audio = await request.file()

      if (!audio) throw new Error('Audio is required.')

      const tmpDir = path.resolve('./tmp')
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)

      const tempPath = path.join(tmpDir, `${Date.now()}-${audio.filename}`)
      await audio.toBuffer().then(buffer => fs.promises.writeFile(tempPath, buffer))

      try {
        // Transcrição offline
        const transcription = await transcribeAudio(tempPath)

        // Gerar embeddings
        const embeddings = await generateEmbeddings(transcription)

        // Obter última transcrição/embeddings do banco pra contexto
        const previousTranscriptions = await db
          .select()
          .from(schema.audioChunks)
          .where({ roomId })
          .orderBy('created_at')
          .then(rows => rows.map(r => r.transcription))

        // Gerar resposta da IA
        const aiResponse = await generateAnswer(transcription, previousTranscriptions)

        // Salvar no banco
        const result = await db
          .insert(schema.audioChunks)
          .values({ roomId, transcription, embeddings, aiResponse })
          .returning()

        const chunk = result[0]
        if (!chunk) throw new Error('Erro ao salvar chunk de áudio')

        return reply.status(201).send({ 
          chunkId: chunk.id, 
          transcription,
          aiResponse
        })
      } finally {
        fs.promises.unlink(tempPath).catch(() => null)
      }
    }
  )
}
