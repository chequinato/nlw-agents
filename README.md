NLW Agents 🤖🎧

Sistema de agentes inteligentes que permite criar salas, gravar áudio, transcrever aulas e conversas usando Gemini Embeddings e gerar respostas com Inteligência Artificial, tanto por voz quanto por texto.

Este projeto nasceu com um propósito educacional muito claro: entender conceitos explicados em aulas gravadas. A ideia é transformar áudio em conhecimento estruturado, permitindo que o usuário faça perguntas depois e receba respostas baseadas exatamente no conteúdo que foi falado, mesmo que ele não tenha entendido tudo no momento da aula.

────────────────────

Visão Geral

O NLW Agents é uma aplicação que combina voz, texto, banco de dados vetorial e inteligência artificial para criar experiências conversacionais baseadas em conteúdo falado.

O sistema funciona a partir do conceito de salas. Dentro de uma sala, usuários podem gravar áudios (como aulas, explicações ou conversas). Esses áudios são processados, transcritos e armazenados como conhecimento. Depois disso, a IA consegue responder perguntas com base nesse conteúdo gravado.

Na prática, o projeto transforma áudio em uma base de conhecimento pesquisável e inteligente.

────────────────────

Problema que o projeto resolve

Conteúdos em áudio, como aulas e palestras, são difíceis de revisar depois. Não dá para buscar facilmente por um conceito específico, o conteúdo fica perdido no tempo e revisar horas de gravação é cansativo.

O NLW Agents resolve esse problema ao:

transformar áudio em texto

gerar embeddings semânticos desse conteúdo

armazenar tudo em banco de dados

permitir perguntas por texto ou voz

responder com base no que realmente foi falado na aula

Ou seja, o áudio deixa de ser algo “morto” e vira conhecimento ativo.

────────────────────

Funcionalidades

Criação e gerenciamento de salas
Gravação de áudio pelos usuários
Transcrição automática de áudio
Geração de embeddings com Gemini
Armazenamento dos embeddings no banco de dados
Respostas de IA baseadas no conteúdo gravado
Envio de perguntas por texto
Manutenção de contexto por sala

────────────────────

Como a Inteligência Artificial funciona no projeto

Fluxo de áudio (aulas gravadas):

O usuário grava um áudio dentro de uma sala.
Esse áudio é enviado ao backend.
O Gemini transcreve o áudio para texto.
O texto é convertido em embeddings vetoriais.
Esses embeddings são armazenados no banco de dados.
O conteúdo passa a fazer parte da memória da sala.

Fluxo de perguntas por texto:

O usuário envia uma pergunta escrita.
A pergunta também é transformada em embedding.
O sistema busca no banco os trechos mais relevantes da aula.
A IA gera uma resposta baseada nesses trechos.

Mesmo que o usuário não tenha entendido o conteúdo na hora da aula, ele pode perguntar depois e a IA explica com base no que foi gravado.

────────────────────

Banco de Dados

O projeto utiliza PostgreSQL como banco de dados principal, junto com a extensão pgvector, que permite armazenar embeddings vetoriais.

O Prisma ORM é utilizado para comunicação com o banco de dados, migrations e modelagem.

São armazenados:

Salas

Mensagens

Transcrições de áudio

Embeddings vetoriais

Contexto das conversas

O uso de um banco vetorial é essencial para permitir busca semântica, onde a IA encontra informações pelo significado e não apenas por palavras exatas.

────────────────────

Tecnologias Utilizadas

Backend:
Node.js
TypeScript
Fastify ou Express
WebSockets ou Socket.IO
Prisma ORM
PostgreSQL com pgvector
dotenv

Áudio:
MediaRecorder API no frontend
Streams e buffers do Node.js
Processamento assíncrono de áudio

Inteligência Artificial:
Google Gemini API
Gemini Embeddings
Prompt engineering para controle de respostas
Busca semântica baseada em vetores

Outras ferramentas:
CORS
Nodemon ou ts-node
ESLint e Prettier (se configurado)

────────────────────

Arquitetura do Projeto

O projeto é organizado de forma modular, separando responsabilidades:

Server: servidor HTTP e comunicação em tempo real
Rooms: lógica de criação e gerenciamento de salas
Database: schema Prisma, migrations e repositórios
Services de IA: integração com Gemini e embeddings
Services de áudio: processamento e transcrição
Utils: funções auxiliares

Essa separação facilita manutenção, escalabilidade e evolução do sistema.

────────────────────

Pré-requisitos

Node.js versão 18 ou superior
PostgreSQL com a extensão pgvector
Conta com acesso à API do Gemini
Gerenciador de pacotes npm ou yarn

────────────────────

Instalação

Clonar o repositório
Instalar dependências
Configurar variáveis de ambiente
Executar as migrations do banco
Rodar o servidor em modo desenvolvimento

────────────────────

Variáveis de Ambiente

PORT: porta da aplicação
DATABASE_URL: URL de conexão com o PostgreSQL
GEMINI_API_KEY: chave da API Gemini
EMBEDDING_MODEL: modelo de embeddings utilizado
LLM_MODEL: modelo de linguagem utilizado para respostas

────────────────────

Execução do Projeto

Após configurar o ambiente e o banco de dados, basta rodar o projeto em modo desenvolvimento. O servidor ficará disponível localmente e pronto para receber áudios e perguntas.

────────────────────

Casos de Uso

Estudo a partir de aulas gravadas
Revisão de conteúdo educacional
Assistente de aprendizado por voz
Chat contextual baseado em áudio
Ferramentas educacionais com IA

────────────────────

Roadmap e Evoluções Futuras

Streaming de áudio em tempo real
Persistência avançada de histórico
Organização por matérias ou temas
Escolha dinâmica de modelos de IA
Deploy em produção
Dashboard de métricas

────────────────────

Contribuição

O projeto aceita contribuições. Basta criar um fork, desenvolver em uma branch separada e abrir um Pull Request.

────────────────────

Licença

MIT License
Projeto desenvolvido por Chequinato
