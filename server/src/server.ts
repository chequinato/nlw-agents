import { buildApp } from './app.js'
import { sql } from './db/connection.js'
import { env } from './env.js'

const app = buildApp()

async function shutdown(signal: string) {
  app.log.info(`${signal} recebido, encerrando...`)
  await app.close()
  await sql.end({ timeout: 5 })
  process.exit(0)
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

try {
  await app.listen({ port: env.PORT, host: env.HOST })
  app.log.info(`Docs da API em http://localhost:${env.PORT}/docs`)
} catch (error) {
  app.log.error(error)
  process.exit(1)
}
