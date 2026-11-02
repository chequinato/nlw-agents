# NLW Agents

Grave uma aula, deixe a IA transcrever e depois pergunte o que não ficou claro. As respostas vêm do que foi falado na gravação.

O projeto nasceu no NLW Agents da Rocketseat e foi estendido com busca semântica de verdade (RAG com pgvector), resumo de aula, transcrição ao vivo e fallback entre provedores de IA.

## Como funciona

```
Gravação (navegador)
  |  trechos de 15 s via MediaRecorder
  v
POST /rooms/:id/audio
  |  1. Gemini transcreve o áudio (ou Whisper local, se configurado)
  |  2. Gemini gera o embedding do texto (768 dimensões)
  |  3. texto + embedding vão para audio_chunks (Postgres + pgvector)
  v
POST /rooms/:id/questions
  |  1. embedding da pergunta
  |  2. busca os 5 trechos mais próximos por distância de cosseno (índice HNSW)
  |  3. Gemini responde usando só esses trechos (OpenAI como fallback)
  v
Resposta salva e exibida na sala
```

Se a pergunta não tiver relação com o que foi gravado, a IA diz isso primeiro e só depois dá uma explicação geral, deixando claro que ela não veio da aula.

## Funcionalidades

- Salas por aula ou matéria, com contagem de perguntas e trechos gravados
- Gravação no navegador com cronômetro e transcrição ao vivo de cada trecho
- Perguntas respondidas com base nos trechos mais relevantes da gravação (RAG)
- Resumo de estudo da aula: ideia central, tópicos e perguntas de revisão
- Transcrição completa da sala, em ordem
- Exclusão de sala em cascata (perguntas e áudios saem junto)
- Documentação interativa da API em `/docs` (Swagger)

## Estrutura

```
nlw-agents/
  server/   API (Fastify, Drizzle, Postgres + pgvector, Gemini)
  web/      Interface (React, Vite, TanStack Query, Tailwind, shadcn/ui)
  9.mp3     Áudio de exemplo para testar o upload
```

## Rodando localmente

Pré-requisitos: Node.js 20.6+, Docker e uma chave do Gemini ([aistudio.google.com/apikey](https://aistudio.google.com/apikey)).

```bash
npm run setup          # instala server e web
npm run db:up          # sobe o Postgres com pgvector
cp server/.env.example server/.env   # e preencha GEMINI_API_KEY
npm run db:migrate     # cria as tabelas
```

Em dois terminais:

```bash
npm run dev:server     # http://localhost:3333  (docs em /docs)
npm run dev:web        # http://localhost:5173
```

Para conferir tudo de uma vez (lint, tipos, testes e build): `npm run check`.

## Variáveis de ambiente (server/.env)

| Variável | Obrigatória | Padrão | Para quê |
| --- | --- | --- | --- |
| `DATABASE_URL` | sim | | Postgres com pgvector |
| `GEMINI_API_KEY` | sim | | Transcrição, embeddings, respostas e resumo |
| `PORT` | não | `3333` | Porta da API |
| `WEB_URL` | não | `http://localhost:5173` | Origens liberadas no CORS (separe por vírgula) |
| `GEMINI_MODEL` | não | `gemini-2.5-flash` | Modelo de texto |
| `GEMINI_EMBEDDING_MODEL` | não | `gemini-embedding-001` | Modelo de embeddings |
| `OPENAI_API_KEY` | não | | Liga o fallback para a OpenAI |
| `OPENAI_MODEL` | não | `gpt-4o-mini` | Modelo do fallback |
| `TRANSCRIPTION_PROVIDER` | não | `gemini` | `gemini` ou `whisper` (local) |

O front lê `VITE_API_URL` (padrão `http://localhost:3333`).

## Endpoints

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/health` | Status da API e do banco |
| GET | `/rooms` | Lista as salas |
| POST | `/rooms` | Cria uma sala |
| GET | `/rooms/:roomId` | Detalhes da sala |
| DELETE | `/rooms/:roomId` | Apaga a sala e tudo dela |
| GET | `/rooms/:roomId/questions` | Perguntas da sala |
| POST | `/rooms/:roomId/questions` | Pergunta para a IA |
| POST | `/rooms/:roomId/audio` | Envia um trecho de áudio (multipart, campo `file`) |
| GET | `/rooms/:roomId/transcriptions` | Transcrição da sala |
| POST | `/rooms/:roomId/summary` | Gera o resumo da aula |

Exemplos prontos em [server/client.http](server/client.http).

## Tecnologias

**Backend:** Node.js, TypeScript, Fastify 5, Zod, Drizzle ORM, PostgreSQL 17 + pgvector, Google Gen AI SDK (Gemini), OpenAI SDK, Swagger, Biome, testes com `node:test`.

**Frontend:** React 19, Vite 7, TanStack Query 5, React Hook Form + Zod, React Router 7, Tailwind CSS 4, shadcn/ui.

## Licença

MIT. Projeto desenvolvido por Chequinato.
