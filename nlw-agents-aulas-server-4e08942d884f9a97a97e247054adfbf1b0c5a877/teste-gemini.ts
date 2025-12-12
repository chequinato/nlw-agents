import 'dotenv/config';
import { GoogleAuth } from 'google-auth-library';
import fetch from 'node-fetch';

async function generateEmbeddings(text: string) {
  try {
    // Cria cliente autenticado usando ADC
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
    const client = await auth.getClient();
    const projectId = await auth.getProjectId();

    // URL do endpoint do modelo de embeddings
    const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/text-embedding-005:predict`;

    // Requisição
    const res = await client.request({
      url,
      method: 'POST',
      data: {
        instances: [
          { content: text, task_type: "QUESTION_ANSWERING" }
        ],
        parameters: { outputDimensionality: 256 }
      }
    });

    console.log("💬 Corpo bruto da resposta:", res.data);
    return res.data?.predictions?.[0]?.embeddings?.values ?? [];
  } catch (err) {
    console.error("❌ Erro em generateEmbeddings:", err);
    return [];
  }
}

async function runTest() {
  const question = "O que é produção em massa?";
  const embedding = await generateEmbeddings(question);
  console.log("✅ Embedding gerado (10 primeiros valores):", embedding.slice(0, 10));
}

runTest();
