import * as dotenv from 'dotenv';
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().url().startsWith('postgresql://'),
  GEMINI_API_KEY: z.string(),
  OPENAI_API_KEY: z.string(),
})

export const env = envSchema.parse(process.env)
