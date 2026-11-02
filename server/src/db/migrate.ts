// Aplica as migrations sem depender do drizzle-kit (usado no container de produção)
import 'dotenv/config'
import { fileURLToPath } from 'node:url'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('DATABASE_URL não definida.')
  process.exit(1)
}

const sql = postgres(databaseUrl, { max: 1 })

await migrate(drizzle(sql), {
  migrationsFolder: fileURLToPath(new URL('./migrations', import.meta.url)),
})

await sql.end()

console.log('Migrations aplicadas.')
