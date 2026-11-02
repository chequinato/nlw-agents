import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { transcribe } from '../../services/ai.js'
import { generateEmbeddings } from '../../services/gemini.js'
import { BadRequestError, ServiceUnavailableError } from '../errors.js'
import {
  assertRoomExists,
  errorResponseSchema,
  roomParamsSchema,
} from '../schemas.js'

export const uploadAudioRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/rooms/:roomId/audio',
    {
      schema: {
        tags: ['audio'],
        summary: 'Recebe um trecho de áudio, transcreve e indexa',
        consumes: ['multipart/form-data'],
        params: roomParamsSchema,
        response: {
          201: z.object({
            chunkId: z.uuid(),
            transcription: z.string(),
          }),
          200: z.object({
            chunkId: z.null(),
            transcription: z.literal(''),
          }),
          400: errorResponseSchema,
          404: errorResponseSchema,
          503: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { roomId } = request.params

      await assertRoomExists(roomId)

      const audio = await request.file()

      if (!audio) {
        throw new BadRequestError('Envie o áudio no campo "file".')
      }

      // O MediaRecorder manda "audio/webm;codecs=opus"; o Gemini quer só "audio/webm"
      const mimeType = audio.mimetype.split(';')[0]?.trim() ?? ''

      if (!mimeType.startsWith('audio/')) {
        throw new BadRequestError(
          `Formato não suportado: ${audio.mimetype}. Envie um arquivo de áudio.`
        )
      }

      // Lança RequestFileTooLargeError (413) se passar do limite do multipart
      const buffer = await audio.toBuffer()

      let transcription: string
      let embeddings: number[]

      try {
        transcription = await transcribe(buffer, mimeType)

        // Trecho sem fala: nada para indexar
        if (!transcription) {
          return reply.status(200).send({ chunkId: null, transcription: '' })
        }

        embeddings = await generateEmbeddings(
          transcription,
          'RETRIEVAL_DOCUMENT'
        )
      } catch (error) {
        request.log.error({ err: error }, 'Falha ao processar o áudio')
        throw new ServiceUnavailableError(
          'Não foi possível transcrever o áudio agora. Tente novamente.'
        )
      }

      const [chunk] = await db
        .insert(schema.audioChunks)
        .values({ roomId, transcription, embeddings })
        .returning({ id: schema.audioChunks.id })

      if (!chunk) {
        throw new Error('Falha ao salvar o trecho de áudio.')
      }

      return reply.status(201).send({ chunkId: chunk.id, transcription })
    }
  )
}
