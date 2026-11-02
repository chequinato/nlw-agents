import { execFile } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { env } from '../env.js'

// Funciona tanto em src/services quanto em dist/services: os dois estão a
// dois níveis de server/scripts
const scriptPath = fileURLToPath(
  new URL('../../scripts/whisper_local.py', import.meta.url)
)

/**
 * Transcreve um arquivo de áudio com o Whisper local (Python).
 * Exige `pip install openai-whisper` e ffmpeg no PATH.
 */
export function transcribeAudioFile(audioPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      env.PYTHON_BIN,
      [scriptPath, audioPath],
      { maxBuffer: 10 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr || error.message))
          return
        }

        resolve(stdout.trim())
      }
    )
  })
}
