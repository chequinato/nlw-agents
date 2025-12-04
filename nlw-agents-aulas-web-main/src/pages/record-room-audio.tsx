// src/pages/record-room-audio.tsx
import { useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'

type RoomParams = { roomId: string }

export function RecordRoomAudio() {
  const params = useParams<RoomParams>()
  const [isRecording, setIsRecording] = useState(false)
  const [transcriptions, setTranscriptions] = useState<string[]>([])
  const [aiResponses, setAiResponses] = useState<string[]>([])
  const recorder = useRef<MediaRecorder | null>(null)
  const intervalRef = useRef<NodeJS.Timeout>(null)

  const isRecordingSupported =
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function' &&
    typeof window.MediaRecorder === 'function'

  async function uploadAudio(audio: Blob) {
    // Ignora chunks muito pequenos (menos de 20KB)
    if (audio.size < 20000) {
      console.log('Chunk muito pequeno, ignorado:', audio.size, 'bytes')
      return
    }

    const formData = new FormData()
    formData.append('file', audio, 'audio.webm')

    try {
      const response = await fetch(
        `http://localhost:3333/rooms/${params.roomId}/audio`,
        { method: 'POST', body: formData }
      )

      if (!response.ok) {
        const error = await response.json()
        console.error('Erro na resposta:', response.status, error)
        return
      }

      const result = await response.json()

      if (result.transcription) setTranscriptions(prev => [...prev, result.transcription])
      if (result.aiResponse) setAiResponses(prev => [...prev, result.aiResponse])
      console.log('Chunk enviado:', result)
    } catch (err) {
      console.error('Erro ao enviar áudio:', err)
    }
  }

  function createRecorder(audioStream: MediaStream) {
    recorder.current = new MediaRecorder(audioStream, { mimeType: 'audio/webm', audioBitsPerSecond: 64_000 })

    recorder.current.ondataavailable = (event) => { 
      if(event.data.size > 0) uploadAudio(event.data) 
    }
    recorder.current.onstart = () => console.log('Gravação iniciada!')
    recorder.current.onstop = () => console.log('Gravação pausada/finalizada')
    recorder.current.start()
  }

  async function startRecording() {
    if (!isRecordingSupported) { alert('Seu navegador não suporta gravação'); return }

    setIsRecording(true)
    const audioStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 } })
    createRecorder(audioStream)

    // Envia a cada 10s, mas também envia imediatamente ao pausar
    intervalRef.current = setInterval(() => {
      recorder.current?.stop()
      createRecorder(audioStream)
    }, 10000)
  }

  function stopRecording() {
    setIsRecording(false)
    if(recorder.current && recorder.current.state !== 'inactive') recorder.current.stop()
    if(intervalRef.current) clearInterval(intervalRef.current)
  }

  if (!params.roomId) return <Navigate replace to="/" />

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3">
      {isRecording ? (
        <Button onClick={stopRecording}>Pausar gravação</Button>
      ) : (
        <Button onClick={startRecording}>Gravar áudio</Button>
      )}
      {isRecording ? <p>Gravando...</p> : <p>Pausado</p>}
      {transcriptions.length > 0 && (
        <div className="mt-6 w-full max-w-lg bg-zinc-800 p-4 rounded">
          <h2 className="font-bold mb-2">Transcrição</h2>
          {transcriptions.map((t, i) => <p key={i} className="text-white mb-1">{t}</p>)}
        </div>
      )}
      {aiResponses.length > 0 && (
        <div className="mt-6 w-full max-w-lg bg-zinc-700 p-4 rounded">
          <h2 className="font-bold mb-2 text-blue-400">Resposta da IA</h2>
          {aiResponses.map((r, i) => <p key={i} className="text-white mb-1">{r}</p>)}
        </div>
      )}
    </div>
  )
}
