import 'dotenv/config';
import fetch from 'node-fetch';

async function listModelsREST() {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );
    if (!res.ok) {
      throw new Error(`Erro HTTP ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log("Modelos disponíveis:", data.models);
  } catch (err) {
    console.error("Erro ao listar modelos REST:", err);
  }
}

listModelsREST();
