import sys
import whisper

def main():
    if len(sys.argv) < 2:
        print("Arquivo de áudio não fornecido")
        sys.exit(1)

    audio_path = sys.argv[1]

    # Carrega o modelo local
    model = whisper.load_model("small")  # ou tiny, base, medium, large
    result = model.transcribe(audio_path, language="pt")
    
    print(result["text"])  # envia a transcrição pro Node

if __name__ == "__main__":
    main()
