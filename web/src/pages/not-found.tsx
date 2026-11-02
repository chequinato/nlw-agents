import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-bold text-3xl">Página não encontrada</h1>
      <p className="text-muted-foreground">
        O endereço que você abriu não existe.
      </p>
      <Button asChild variant="outline">
        <Link to="/">
          <ArrowLeft />
          Voltar ao início
        </Link>
      </Button>
    </div>
  )
}
