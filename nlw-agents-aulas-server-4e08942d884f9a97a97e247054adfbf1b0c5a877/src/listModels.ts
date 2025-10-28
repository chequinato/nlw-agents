import 'dotenv/config';
import { text } from '@google/generative-ai';
import { env } from './env.ts';

async function main() {
  try {
    const response = await text({
      apiKey: env.GEMINI_API_KEY,
      model: 'gemini-1.5',
      prompt: 'Olá, teste de modelo Gemini',
      temperature: 0.7,
    });

    console.log('Resposta do modelo:', response.output?.[0]?.content?.[0]?.text);
  } catch (err) {
    console.error('Erro real aqui:', err);
  }
}

main();
