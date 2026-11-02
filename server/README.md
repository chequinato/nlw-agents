# NLW Agents - API

API em Fastify que transcreve aulas, indexa os trechos com embeddings no pgvector e responde perguntas com base neles. Visão geral do projeto no [README da raiz](../README.md).

## Setup

```bash
docker compose up -d           # Postgres 17 + pgvector na porta 5432
cp .env.example .env           # preencha GEMINI_API_KEY
npm install
npm run db:migrate
npm run dev                    # http://localhost:3333, docs em /docs
```

Para subir a API em container junto com o banco: `docker compose --profile app up -d --build` (as migrations rodam na inicialização).

## Scripts

| Script | O que faz |
| --- | --- |
| `npm run dev` | Servidor com recarga automática |
| `npm run build` / `npm start` | Compila para `dist/` e roda a versão compilada |
| `npm test` | Testes (`node:test`) de prompts, vetores e validação das rotas |
| `npm run lint` / `npm run typecheck` | Biome e TypeScript |
| `npm run db:generate` | Gera migration a partir do schema |
| `npm run db:migrate` | Aplica as migrations |
| `npm run db:studio` | Abre o Drizzle Studio |
| `npm run db:seed` | Popula com salas e perguntas de exemplo (apaga os dados atuais) |
| `npm run db:reindex` | Recalcula embeddings de trechos gravados pela versão antiga, que salvava vetores zerados |
| `npm run list-models` | Lista os modelos do Gemini disponíveis para a sua chave |

## Organização

```
src/
  app.ts                 monta o Fastify (CORS, multipart, Swagger, erros, rotas)
  server.ts              sobe o servidor e trata o encerramento
  env.ts                 variáveis de ambiente validadas com Zod
  db/                    conexão, schema, migrations, seed e migrate
  http/routes/           uma rota por arquivo
  http/schemas.ts        schemas compartilhados e checagem de sala
  http/errors.ts         erros HTTP tipados (404, 400, 503)
  services/ai.ts         orquestra provedores: Gemini -> OpenAI, Gemini | Whisper
  services/gemini.ts     transcrição, embeddings, respostas e resumo
  services/openai.ts     fallback de respostas
  services/prompts.ts    prompts centralizados
scripts/whisper_local.py transcrição local opcional (pip install openai-whisper)
```

## Whisper local (opcional)

Com `TRANSCRIPTION_PROVIDER=whisper`, a API chama `scripts/whisper_local.py` em vez do Gemini. Precisa de Python, `pip install openai-whisper` e ffmpeg no PATH. Os embeddings continuam vindo do Gemini.
