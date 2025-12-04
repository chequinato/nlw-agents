# whisper_local.py
import sys
import whisper

def main():
    if len(sys.argv) < 2:
        print("Usage: python whisper_local.py <audio_path>")
        sys.exit(1)

    audio_path = sys.argv[1]

    try:
        # Carrega o modelo do Whisper (pode ser "base", "small", "medium", "large")
        model = whisper.load_model("base")

        # Faz a transcrição
        result = model.transcribe(audio_path)

        # Imprime só o texto
        print(result["text"])

    except Exception as e:
        print(f"Erro ao transcrever áudio: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
