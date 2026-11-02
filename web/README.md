# NLW Agents - Web

Interface em React para criar salas, gravar aulas e conversar com a IA sobre o conteúdo gravado. Visão geral do projeto no [README da raiz](../README.md).

## Setup

```bash
npm install
npm run dev        # http://localhost:5173
```

A API precisa estar rodando (padrão `http://localhost:3333`). Para apontar para outro endereço, crie um `.env` a partir do `.env.example` e defina `VITE_API_URL`.

## Telas

- **Início** (`/`): cria salas e lista as recentes, com contagem de perguntas e trechos de áudio.
- **Sala** (`/room/:roomId`): resumo da aula, transcrição completa, perguntas e respostas. A pergunta aparece na hora com "gerando resposta..." (update otimista) e volta para o campo se der erro.
- **Gravação** (`/room/:roomId/audio`): cronômetro, envio em trechos de 15 s numa fila ordenada e transcrição ao vivo de cada trecho.

## Organização

```
src/
  pages/            telas
  components/       componentes da aplicação
  components/ui/    componentes do shadcn/ui
  http/             hooks do TanStack Query, tipos e chaves de cache
  lib/api.ts        fetch com URL base e erros tipados
```

## Scripts

`npm run dev`, `npm run build`, `npm run preview`, `npm run lint`, `npm run typecheck`.
