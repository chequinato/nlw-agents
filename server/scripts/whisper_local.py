# whisper_local.py
# Transcricao local, usada quando TRANSCRIPTION_PROVIDER=whisper.
# Requisitos: pip install openai-whisper  (e ffmpeg no PATH)
import os
import sys

import whisper


def main():
    if len(sys.argv) < 2:
        print("Usage: python whisper_local.py <audio_path>", file=sys.stderr)
        sys.exit(1)

    # No Windows o stdout padrao e cp1252 e quebra os acentos lidos pelo Node
    sys.stdout.reconfigure(encoding="utf-8")

    audio_path = sys.argv[1]

    try:
        # Modelos: "tiny", "base", "small", "medium", "large"
        model = whisper.load_model(os.environ.get("WHISPER_MODEL", "base"))

        # fp16=False evita o aviso (e a falha) de rodar em CPU
        result = model.transcribe(audio_path, language="pt", fp16=False)

        print(result["text"].strip())

    except Exception as e:
        print(f"Erro ao transcrever audio: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
