// src/http/routes/upload-audio.ts
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import fs from 'fs'
import path from 'path'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { eq, asc } from 'drizzle-orm'
import { transcribeAudio } from '../../services/whisper_local.js'
import { generateAnswer } from '../../services/gemini.js'

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
        // 1️⃣ Transcreve o áudio
        let transcription = await transcribeAudio(tempPath)

        if (!transcription || transcription.trim() === '') {
          transcription = '[Áudio não pôde ser transcrito]'
        }

        // 2️⃣ Busca transcrições anteriores
        const previousTranscriptions = await db
          .select()
          .from(schema.audioChunks)
          .where(eq(schema.audioChunks.roomId, roomId))
          .orderBy(asc(schema.audioChunks.createdAt))
          .then((rows) => rows.map((r) => r.transcription).filter(t => t && t.trim() !== ''))

        // 3️⃣ Junta todas as transcrições em um array
        const allTranscriptions = [...previousTranscriptions, transcription]

        // 4️⃣ Pergunta do usuário (pode vir do frontend ou usar o próprio áudio como base)
        const question = transcription.slice(0, 200) // primeiros 200 caracteres como "pergunta"

        // 5️⃣ Chama o Gemini
        let aiResponse = ''
        try {
          aiResponse = await generateAnswer(question, allTranscriptions)
        } catch (geminiError) {
          console.error('❌ Gemini falhou:', geminiError)
          aiResponse = 'Desculpe, não consegui processar sua pergunta no momento. Tente novamente mais tarde.'
        }

        // 6️⃣ Embeddings padrão (temporário)
        const embeddings = Array(768).fill(0)

        // 7️⃣ Salva no banco
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

        // 8️⃣ Retorna resultado
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
