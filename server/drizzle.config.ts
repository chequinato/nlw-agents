import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

// Lê só o DATABASE_URL: gerar e rodar migrations não deve exigir chaves de IA
const databaseUrl =
  process.env.DATABASE_URL ?? 'postgresql://docker:docker@localhost:5432/agents'

export default defineConfig({
  dialect: 'postgresql',
  casing: 'snake_case',
  schema: './src/db/schema/**.ts',
  out: './src/db/migrations',
  dbCredentials: {
    url: databaseUrl,
  },
})
