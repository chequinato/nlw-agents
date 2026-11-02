import { ArrowLeft, Loader2, Mic, Square } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useUploadAudio } from '@/http/use-room-audio'
import { useRoom } from '@/http/use-rooms'

type RoomParams = { roomId: string }

// Cada trecho vira um arquivo de áudio completo, transcrito e indexado à parte.
// Trechos maiores dão transcrições e embeddings com mais contexto.
const CHUNK_DURATION_MS = 15_000

// Trechos menores que isso são quase só silêncio/cabeçalho do arquivo
const MIN_CHUNK_SIZE_BYTES = 5000

const PREFERRED_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/mp4',
]

type ChunkStatus = 'sending' | 'done' | 'empty' | 'error'

type Chunk = {
  id: number
  status: ChunkStatus
  transcription?: string
  error?: string
}

const isRecordingSupported =
  typeof navigator !== 'undefined' &&
  !!navigator.mediaDevices &&
  typeof navigator.mediaDevices.getUserMedia === 'function' &&
  typeof window.MediaRecorder === 'function'

function pickMimeType() {
  return PREFERRED_MIME_TYPES.find((type) =>
    MediaRecorder.isTypeSupported(type)
  )
}

function formatElapsed(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function RecordRoomAudio() {
  const params = useParams<RoomParams>()

  if (!params.roomId) {
    return <Navigate replace to="/" />
  }

  return <Recorder roomId={params.roomId} />
}

function Recorder({ roomId }: { roomId: string }) {
  const { data: room } = useRoom(roomId)
  const { mutateAsync: uploadAudio } = useUploadAudio(roomId)

  const [isRecording, setIsRecording] = useState(false)
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [chunks, setChunks] = useState<Chunk[]>([])

  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const rotateIntervalRef = useRef<ReturnType<typeof setInterval>>(null)
  const clockIntervalRef = useRef<ReturnType<typeof setInterval>>(null)
  const chunkIdRef = useRef(0)
  // Fila: os trechos sobem um de cada vez para ficarem em ordem no banco
  const uploadQueueRef = useRef<Promise<void>>(Promise.resolve())

  function updateChunk(id: number, patch: Partial<Chunk>) {
    setChunks((previous) =>
      previous.map((chunk) =>
        chunk.id === id ? { ...chunk, ...patch } : chunk
      )
    )
  }

  function enqueueUpload(audio: Blob) {
    if (audio.size < MIN_CHUNK_SIZE_BYTES) {
      return
    }

    chunkIdRef.current += 1
    const id = chunkIdRef.current

    setChunks((previous) => [...previous, { id, status: 'sending' }])

    uploadQueueRef.current = uploadQueueRef.current.then(async () => {
      try {
        const result = await uploadAudio(audio)

        updateChunk(
          id,
          result.chunkId
            ? { status: 'done', transcription: result.transcription }
            : { status: 'empty' }
        )
      } catch (error) {
        updateChunk(id, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Falha no envio.',
        })
      }
    })
  }

  function startRecorder(stream: MediaStream) {
    const mimeType = pickMimeType()
    const recorder = new MediaRecorder(stream, {
      mimeType,
      audioBitsPerSecond: 64_000,
    })

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        enqueueUpload(event.data)
      }
    }

    recorder.start()
    recorderRef.current = recorder
  }

  async function startRecording() {
    setPermissionError(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      })

      streamRef.current = stream
      startRecorder(stream)
      setIsRecording(true)

      // Para e recomeça o gravador: cada stop() gera um arquivo completo
      rotateIntervalRef.current = setInterval(() => {
        recorderRef.current?.stop()
        startRecorder(stream)
      }, CHUNK_DURATION_MS)

      clockIntervalRef.current = setInterval(() => {
        setElapsed((seconds) => seconds + 1)
      }, 1000)
    } catch (error) {
      setPermissionError(
        error instanceof DOMException && error.name === 'NotAllowedError'
          ? 'Permissão de microfone negada. Libere o acesso no navegador e tente de novo.'
          : 'Não foi possível acessar o microfone.'
      )
    }
  }

  function stopRecording() {
    if (rotateIntervalRef.current) {
      clearInterval(rotateIntervalRef.current)
    }
    if (clockIntervalRef.current) {
      clearInterval(clockIntervalRef.current)
    }

    if (recorderRef.current?.state !== 'inactive') {
      recorderRef.current?.stop()
    }

    for (const track of streamRef.current?.getTracks() ?? []) {
      track.stop()
    }

    recorderRef.current = null
    streamRef.current = null
    setIsRecording(false)
  }

  // Sair da página no meio da gravação também libera o microfone
  // biome-ignore lint/correctness/useExhaustiveDependencies: só no unmount
  useEffect(() => stopRecording, [])

  const sending = chunks.filter((chunk) => chunk.status === 'sending').length
  const transcribed = chunks.filter((chunk) => chunk.status === 'done')

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Button asChild className="mb-8" variant="outline">
          <Link to={`/room/${roomId}`}>
            <ArrowLeft />
            Voltar para a sala
          </Link>
        </Button>

        <h1 className="mb-1 font-bold text-3xl">Gravar áudio</h1>
        <p className="mb-8 text-muted-foreground">
          {room?.name ?? 'Carregando sala...'}
        </p>

        <div className="flex flex-col items-center gap-4 rounded-xl border p-8">
          <span className="font-mono text-5xl tabular-nums">
            {formatElapsed(elapsed)}
          </span>

          <div className="flex items-center gap-2 text-sm">
            <span
              className={
                isRecording
                  ? 'size-2 animate-pulse rounded-full bg-red-500'
                  : 'size-2 rounded-full bg-muted-foreground'
              }
            />
            {isRecording ? 'Gravando' : 'Parado'}
          </div>

          {isRecordingSupported ? (
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              size="lg"
              variant={isRecording ? 'destructive' : 'default'}
            >
              {isRecording ? <Square /> : <Mic />}
              {isRecording ? 'Parar gravação' : 'Começar a gravar'}
            </Button>
          ) : (
            <p className="text-destructive text-sm">
              Este navegador não suporta gravação de áudio.
            </p>
          )}

          {permissionError && (
            <p className="text-center text-destructive text-sm" role="alert">
              {permissionError}
            </p>
          )}

          <p className="max-w-sm text-center text-muted-foreground text-xs">
            O áudio é enviado em trechos de {CHUNK_DURATION_MS / 1000} segundos.
            Cada trecho é transcrito e passa a responder perguntas na sala.
          </p>
        </div>

        {chunks.length > 0 && (
          <div className="mt-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="mr-auto font-semibold text-xl">
                Transcrição ao vivo
              </h2>
              {sending > 0 && (
                <Badge variant="secondary">
                  <Loader2 className="animate-spin" />
                  {sending} enviando
                </Badge>
              )}
              <Badge variant="secondary">
                {transcribed.length} transcritos
              </Badge>
            </div>

            <ol className="space-y-3">
              {chunks.map((chunk) => (
                <li className="rounded-lg border p-3 text-sm" key={chunk.id}>
                  {chunk.status === 'sending' && (
                    <span className="flex items-center gap-2 text-muted-foreground italic">
                      <Loader2 className="size-3 animate-spin" />
                      Transcrevendo trecho {chunk.id}...
                    </span>
                  )}
                  {chunk.status === 'done' && (
                    <p className="leading-relaxed">{chunk.transcription}</p>
                  )}
                  {chunk.status === 'empty' && (
                    <span className="text-muted-foreground italic">
                      Trecho {chunk.id} sem fala, ignorado.
                    </span>
                  )}
                  {chunk.status === 'error' && (
                    <span className="text-destructive">
                      Trecho {chunk.id}: {chunk.error}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}
