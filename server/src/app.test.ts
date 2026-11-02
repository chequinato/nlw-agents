import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import type { FastifyInstance } from 'fastify'

// Testes que não tocam no banco nem nas IAs: validação, 404 de rota e docs.
// As variáveis precisam existir antes de importar o app (env.ts valida na carga).
process.env.DATABASE_URL ??= 'postgresql://docker:docker@localhost:5432/agents'
process.env.GEMINI_API_KEY ??= 'test-key'
process.env.LOG_LEVEL = 'silent'

let app: FastifyInstance

before(async () => {
  const { buildApp } = await import('./app.js')
  app = buildApp()
  await app.ready()
})

after(async () => {
  await app.close()
  const { sql } = await import('./db/connection.js')
  await sql.end({ timeout: 1 })
})

describe('validação de entrada', () => {
  it('rejeita roomId que não é UUID', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/rooms/nao-e-uuid/questions',
    })

    assert.equal(response.statusCode, 400)
    assert.equal(response.json().message, 'Dados inválidos.')
    assert.equal(response.json().issues[0].field, 'roomId')
  })

  it('rejeita sala com nome curto demais', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/rooms',
      payload: { name: 'ab' },
    })

    assert.equal(response.statusCode, 400)
    assert.equal(response.json().issues[0].field, 'name')
  })

  it('rejeita pergunta vazia', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/rooms/3bedbc7f-9cc3-4d1c-a43f-09d0c92a5f4b/questions',
      payload: { question: '   ' },
    })

    assert.equal(response.statusCode, 400)
  })
})

describe('documentação', () => {
  it('publica o OpenAPI com as rotas de salas', async () => {
    const response = await app.inject({ method: 'GET', url: '/docs/json' })

    assert.equal(response.statusCode, 200)

    const paths = Object.keys(response.json().paths)

    assert.ok(paths.includes('/rooms'))
    assert.ok(paths.includes('/rooms/{roomId}/questions'))
    assert.ok(paths.includes('/rooms/{roomId}/summary'))
  })
})
