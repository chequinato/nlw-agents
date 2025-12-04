// src/http/routes/create-question.ts
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { eq, asc } from 'drizzle-orm'
import { db } from '../../db/connection'
import { schema } from '../../db/schema/index'
import { generateAIResponse } from '../../services/openai'
import { generateAnswer } from '../../services/gemini'

export async function createQuestion(app: FastifyInstance) {
  app.post('/rooms/:roomId/questions', async (request, reply) => {
    const bodySchema = z.object({
      question: z.string(),
    })
    const { question } = bodySchema.parse(request.body)
    const { roomId } = request.params as { roomId: string }

    try {
      // Busca transcrições anteriores (contexto da aula)
      const audioChunks = await db
        .select()
        .from(schema.audioChunks)
        .where(eq(schema.audioChunks.roomId, roomId))
        .orderBy(asc(schema.audioChunks.createdAt))

      const context = audioChunks
        .map((chunk) => chunk.transcription)
        .join('\n\n')

      let aiResponse = ''

      // Tenta OpenAI primeiro
      try {
        aiResponse = await generateAIResponse(question, context || undefined)
        console.log('✅ OpenAI respondeu com sucesso')
      } catch (openaiError: any) {
        console.warn('⚠️ OpenAI falhou, usando Gemini:', openaiError?.message || openaiError)
        
        // Fallback para Gemini
        try {
          const transcriptions = audioChunks.map((chunk) => chunk.transcription)
          aiResponse = await generateAnswer(question, transcriptions)
          console.log('✅ Gemini respondeu com sucesso')
        } catch (geminiError) {
          console.error('❌ Ambas as IAs falharam:', geminiError)
          aiResponse = 'Desculpe, não consegui processar sua pergunta no momento. Tente novamente mais tarde.'
        }
      }

      // Salva no banco com Drizzle
      const [savedQuestion] = await db
        .insert(schema.questions)
        .values({
          roomId,
          question,
          answer: aiResponse,
          createdAt: new Date(),
        })
        .returning({
          id: schema.questions.id,
          question: schema.questions.question,
          answer: schema.questions.answer,
        })

      return reply.status(201).send({
        success: true,
        id: savedQuestion.id,
        answer: savedQuestion.answer,
      })
    } catch (error) {
      console.error('Erro ao processar pergunta:', error)
      return reply.status(500).send({
        error: 'Erro ao processar pergunta.',
      })
    }
  })
}
