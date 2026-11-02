import { fastifyCors } from '@fastify/cors'
import { fastifyMultipart } from '@fastify/multipart'
import { fastifySwagger } from '@fastify/swagger'
import { fastifySwaggerUi } from '@fastify/swagger-ui'
import { fastify } from 'fastify'
import {
  hasZodFastifySchemaValidationErrors,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { sql } from './db/connection.js'
import { env } from './env.js'
import { createQuestionRoute } from './http/routes/create-question.js'
import { createRoomRoute } from './http/routes/create-room.js'
import { createRoomSummaryRoute } from './http/routes/create-room-summary.js'
import { deleteRoomRoute } from './http/routes/delete-room.js'
import { getRoomRoute } from './http/routes/get-room.js'
import { getRoomQuestionsRoute } from './http/routes/get-room-questions.js'
import { getRoomTranscriptionsRoute } from './http/routes/get-room-transcriptions.js'
import { getRoomsRoute } from './http/routes/get-rooms.js'
import { uploadAudioRoute } from './http/routes/upload-audio.js'

// 10 s de áudio a 64 kbps dão ~80 KB; 25 MB cobre até arquivos longos enviados de uma vez
const MAX_AUDIO_SIZE = 25 * 1024 * 1024

const LEADING_SLASH = /^\//

export function buildApp() {
  const app = fastify({
    logger: { level: env.LOG_LEVEL },
  }).withTypeProvider<ZodTypeProvider>()

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  app.register(fastifyCors, {
    origin: env.WEB_URL.split(',').map((origin) => origin.trim()),
    methods: ['GET', 'POST', 'DELETE'],
  })

  app.register(fastifyMultipart, {
    limits: { fileSize: MAX_AUDIO_SIZE, files: 1 },
  })

  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'NLW Agents API',
        description:
          'Salas de estudo que transcrevem aulas gravadas e respondem perguntas com IA (RAG com pgvector).',
        version: '2.0.0',
      },
    },
    transform: jsonSchemaTransform,
  })

  app.register(fastifySwaggerUi, { routePrefix: '/docs' })

  app.setErrorHandler((error, request, reply) => {
    if (hasZodFastifySchemaValidationErrors(error)) {
      return reply.status(400).send({
        message: 'Dados inválidos.',
        issues: error.validation.map((issue) => ({
          field: issue.instancePath.replace(LEADING_SLASH, '') || 'root',
          message: issue.message ?? 'Valor inválido.',
        })),
      })
    }

    // Erros esperados (404, 400, 413, 503...) carregam o próprio status
    const statusCode = error.statusCode ?? 500

    if (statusCode < 500 || statusCode === 503) {
      return reply.status(statusCode).send({ message: error.message })
    }

    request.log.error({ err: error }, 'Erro inesperado')
    return reply.status(500).send({ message: 'Erro interno do servidor.' })
  })

  app.get('/health', { schema: { hide: true } }, async (_request, reply) => {
    try {
      await sql`select 1`
      return { status: 'ok', database: 'up' }
    } catch {
      return reply.status(503).send({ status: 'degraded', database: 'down' })
    }
  })

  app.register(getRoomsRoute)
  app.register(getRoomRoute)
  app.register(createRoomRoute)
  app.register(deleteRoomRoute)
  app.register(getRoomQuestionsRoute)
  app.register(createQuestionRoute)
  app.register(uploadAudioRoute)
  app.register(getRoomTranscriptionsRoute)
  app.register(createRoomSummaryRoute)

  return app
}
