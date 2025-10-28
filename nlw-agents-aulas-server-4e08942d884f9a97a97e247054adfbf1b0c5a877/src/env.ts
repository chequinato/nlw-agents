import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().url().startsWith('postgresql://'),
  GEMINI_API_KEY: z.string(),
  OPENAI_API_KEY: z.string(), // 👈 adicione isso

})

export const env = envSchema.parse(process.env)
