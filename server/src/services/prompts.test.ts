import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildAnswerPrompt, buildSummaryPrompt } from './prompts.js'
import { isZeroVector, normalizeVector } from './vector.js'

describe('buildAnswerPrompt', () => {
  it('numera os trechos de contexto e inclui a pergunta', () => {
    const prompt = buildAnswerPrompt('  O que é RAG? ', [
      ' Primeiro trecho ',
      'Segundo trecho',
    ])

    assert.match(prompt, /\[1\] Primeiro trecho/)
    assert.match(prompt, /\[2\] Segundo trecho/)
    assert.ok(prompt.endsWith('Pergunta: O que é RAG?'))
  })

  it('avisa quando não há contexto', () => {
    const prompt = buildAnswerPrompt('Pergunta solta', [])

    assert.match(prompt, /Nenhum trecho relevante/)
  })
})

describe('buildSummaryPrompt', () => {
  it('junta as transcrições na ordem', () => {
    const prompt = buildSummaryPrompt(['a', 'b'])

    assert.ok(prompt.indexOf('a') < prompt.indexOf('b'))
  })
})

describe('normalizeVector', () => {
  it('devolve um vetor de norma 1', () => {
    const normalized = normalizeVector([3, 4])

    assert.deepEqual(normalized, [0.6, 0.8])
  })

  it('não divide por zero', () => {
    assert.deepEqual(normalizeVector([0, 0]), [0, 0])
  })
})

describe('isZeroVector', () => {
  it('detecta os vetores zerados da versão antiga', () => {
    assert.equal(isZeroVector(new Array(768).fill(0)), true)
    assert.equal(isZeroVector([0, 0.1]), false)
  })
})
