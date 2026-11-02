import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod/v4'
import { useCreateRoom } from '@/http/use-create-room'
import { Button } from './ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'

const createRoomSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: 'Inclua no mínimo 3 caracteres' })
    .max(120, { message: 'Use no máximo 120 caracteres' }),
  description: z
    .string()
    .trim()
    .max(1000, { message: 'Use no máximo 1000 caracteres' }),
})

type CreateRoomFormData = z.infer<typeof createRoomSchema>

export function CreateRoomForm() {
  const navigate = useNavigate()
  const { mutateAsync: createRoom, error } = useCreateRoom()

  const createRoomForm = useForm<CreateRoomFormData>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  async function handleCreateRoom({ name, description }: CreateRoomFormData) {
    const { roomId } = await createRoom({ name, description })

    createRoomForm.reset()
    navigate(`/room/${roomId}`)
  }

  const { isSubmitting } = createRoomForm.formState

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar sala</CardTitle>
        <CardDescription>
          Uma sala por aula ou matéria. Grave o áudio dentro dela e depois
          pergunte o que não ficou claro.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...createRoomForm}>
          <form
            className="flex flex-col gap-4"
            onSubmit={createRoomForm.handleSubmit(handleCreateRoom)}
          >
            <FormField
              control={createRoomForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da sala</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isSubmitting}
                      placeholder="Ex.: Banco de Dados - Aula 4"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={createRoomForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      disabled={isSubmitting}
                      placeholder="Sobre o que é essa aula?"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <p className="text-destructive text-sm" role="alert">
                {error.message}
              </p>
            )}

            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting && <Loader2 className="animate-spin" />}
              Criar sala
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
