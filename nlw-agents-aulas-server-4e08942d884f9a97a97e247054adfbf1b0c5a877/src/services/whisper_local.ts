import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

// Criar __dirname compatível com ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function transcribeAudio(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve(__dirname, "whisper_local.py");

    const pythonProcess = spawn("python", [scriptPath, filePath]);

    let output = "";
    let error = "";

    pythonProcess.stdout.on("data", (data) => output += data.toString());
    pythonProcess.stderr.on("data", (data) => error += data.toString());

    pythonProcess.on("close", (code) => {
      if (code !== 0) reject(new Error(`Erro ao transcrever áudio:\n${error}`));
      else resolve(output.trim());
    });
  });
}
