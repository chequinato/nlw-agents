import 'dotenv/config'
import { z } from 'zod/v4'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().default(3333),
  HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),

  DATABASE_URL: z.url().startsWith('postgresql://'),

  // Origens liberadas no CORS, separadas por vírgula
  WEB_URL: z.string().default('http://localhost:5173'),

  GEMINI_API_KEY: z.string().min(1),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  GEMINI_EMBEDDING_MODEL: z.string().default('gemini-embedding-001'),

  // OpenAI é opcional: quando configurada, vira fallback do Gemini
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),

  // gemini: transcreve na nuvem | whisper: roda scripts/whisper_local.py
  TRANSCRIPTION_PROVIDER: z.enum(['gemini', 'whisper']).default('gemini'),
  PYTHON_BIN: z.string().default('python'),
})

export const env = envSchema.parse(process.env)
