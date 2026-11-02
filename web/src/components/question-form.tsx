import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import type { KeyboardEvent } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod/v4'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { useCreateQuestion } from '@/http/use-create-question'

const MAX_QUESTION_LENGTH = 1000

const createQuestionSchema = z.object({
  question: z
    .string()
    .trim()
    .min(10, 'Pergunta deve ter pelo menos 10 caracteres')
    .max(
      MAX_QUESTION_LENGTH,
      `Pergunta deve ter no máximo ${MAX_QUESTION_LENGTH} caracteres`
    ),
})

type CreateQuestionFormData = z.infer<typeof createQuestionSchema>

interface QuestionFormProps {
  roomId: string
}

export function QuestionForm({ roomId }: QuestionFormProps) {
  const { mutateAsync: createQuestion, error } = useCreateQuestion(roomId)

  const form = useForm<CreateQuestionFormData>({
    resolver: zodResolver(createQuestionSchema),
    defaultValues: {
      question: '',
    },
  })

  async function handleCreateQuestion(data: CreateQuestionFormData) {
    // Limpa já: a pergunta aparece na lista com "gerando resposta..."
    form.reset()

    try {
      await createQuestion(data)
    } catch {
      // Devolve o texto para a pessoa não perder o que digitou
      form.setValue('question', data.question)
    }
  }

  // Ctrl/Cmd + Enter envia
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      form.handleSubmit(handleCreateQuestion)()
    }
  }

  const { isSubmitting } = form.formState
  const length = form.watch('question').length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fazer uma pergunta</CardTitle>
        <CardDescription>
          A resposta usa os trechos da aula gravada mais parecidos com a sua
          pergunta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(handleCreateQuestion)}
          >
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sua pergunta</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[100px]"
                      disabled={isSubmitting}
                      onKeyDown={handleKeyDown}
                      placeholder="O que você gostaria de saber?"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex items-start justify-between gap-4">
                    <FormMessage />
                    <span className="ml-auto shrink-0 text-muted-foreground text-xs tabular-nums">
                      {length}/{MAX_QUESTION_LENGTH}
                    </span>
                  </div>
                </FormItem>
              )}
            />

            {error && (
              <p className="text-destructive text-sm" role="alert">
                {error.message}
              </p>
            )}

            <div className="flex items-center justify-between gap-4">
              <span className="hidden text-muted-foreground text-xs sm:inline">
                Ctrl + Enter para enviar
              </span>
              <Button className="ml-auto" disabled={isSubmitting} type="submit">
                {isSubmitting && <Loader2 className="animate-spin" />}
                Enviar pergunta
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
