import { fastifyCors } from '@fastify/cors'
import { fastifyMultipart } from '@fastify/multipart'
import { fastify } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { env } from './env.js'
import { createQuestion } from './http/routes/create-question.js'   // <- CORRETO
import { createRoomRoute } from './http/routes/create-room.js'
import { getRoomQuestions } from './http/routes/get-room-questions.js'
import { getRoomsRoute } from './http/routes/get-rooms.js'
import { uploadAudioRoute } from './http/routes/upload-audio.js'
import { deleteRoom } from './http/routes/delete-room.js'

async function start() {
  try {
    const app = fastify().withTypeProvider<ZodTypeProvider>()

    app.register(fastifyCors, {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    })

    app.register(fastifyMultipart, {
      limits: { fileSize: 20 * 1024 * 1024 },
    })

    app.setSerializerCompiler(serializerCompiler)
    app.setValidatorCompiler(validatorCompiler)

    app.get('/', async () => ({ message: 'API rodando!' }))
    app.get('/health', async () => ({ status: 'ok' }))

    app.register(getRoomsRoute)
    app.register(createRoomRoute)
    app.register(getRoomQuestions)
    app.register(createQuestion)   // <- CORRETO
    app.register(uploadAudioRoute)
    app.register(deleteRoom)

    await app.listen({
      port: env.PORT,
      host: '0.0.0.0',
    })

    console.log(`🚀 Server running at http://localhost:${env.PORT}`)
  } catch (err) {
    console.error('❌ Erro ao iniciar o servidor:', err)
    process.exit(1)
  }
}

start()
