import { fastifyCors } from '@fastify/cors'
import { fastifyMultipart } from '@fastify/multipart'
import { fastify } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { env } from './env.ts'
import { createQuestionRoute } from './http/routes/create-question.ts'
import { createRoomRoute } from './http/routes/create-room.ts'
import { getRoomQuestions } from './http/routes/get-room-questions.ts'
import { getRoomsRoute } from './http/routes/get-rooms.ts'
import { uploadAudioRoute } from './http/routes/upload-audio.ts'

async function start() {
  try {
    const app = fastify().withTypeProvider<ZodTypeProvider>()

    // Configura CORS
    app.register(fastifyCors, {
      origin: 'http://localhost:5173',
    })

    // Configura upload de arquivos
    app.register(fastifyMultipart, {
      limits: {
        fileSize: 20 * 1024 * 1024, // 20MB
      },
    })

    // Compilers do fastify-type-provider-zod
    app.setSerializerCompiler(serializerCompiler)
    app.setValidatorCompiler(validatorCompiler)

    // Rota de teste
    app.get('/health', async () => {
      return { status: 'ok' }
    })

    // Rotas
    app.register(getRoomsRoute)
    app.register(createRoomRoute)
    app.register(getRoomQuestions)
    app.register(createQuestionRoute)
    app.register(uploadAudioRoute)

    // Start do servidor
    await app.listen({ port: env.PORT })
    console.log(`🚀 Server running at http://localhost:${env.PORT}`)
  } catch (err) {
    console.error('❌ Erro ao iniciar o servidor:', err)
    process.exit(1)
  }
}

start()
