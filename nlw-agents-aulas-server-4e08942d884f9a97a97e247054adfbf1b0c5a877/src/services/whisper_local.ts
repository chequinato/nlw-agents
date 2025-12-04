import { execFile } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

// Corrige __dirname no ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Transcreve um arquivo de áudio usando Whisper local via Python
 * @param audioPath Caminho do arquivo de áudio
 * @returns Transcrição como string
 */
export function transcribeAudio(audioPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve(__dirname, "whisper_local.py");

    execFile("python", [scriptPath, audioPath], (err, stdout, stderr) => {
      if (err) {
        console.error("❌ Erro ao chamar Whisper:", err, stderr);
        return reject(new Error(stderr || "Erro desconhecido ao chamar Whisper"));
      }

      resolve(stdout.trim());
    });
  });
}
