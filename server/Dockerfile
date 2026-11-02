# --- build: compila o TypeScript ---
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# --- runtime: só dependências de produção e o dist ---
FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY scripts ./scripts

USER node
EXPOSE 3333

# As variáveis vêm do docker-compose (ou de -e/--env-file), nunca da imagem
CMD ["sh", "-c", "node dist/db/migrate.js && node dist/server.js"]
