import { useRoomQuestions } from '@/http/use-room-questions'
import { QuestionItem } from './question-item'

interface QuestionListProps {
  roomId: string
}

export function QuestionList({ roomId }: QuestionListProps) {
  const { data } = useRoomQuestions(roomId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-2xl text-foreground">
          Perguntas & Respostas ({data?.length ?? 0})
        </h2>
      </div>

      {data?.length ? (
        data.map((question) => <QuestionItem key={question.id} question={question} />)
      ) : (
        <p className="text-muted-foreground">Nenhuma pergunta ainda.</p>
      )}
    </div>
  )
}
