export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/**
 * fetch com a URL base da API e erro tipado: respostas fora de 2xx viram
 * ApiError com a mensagem que o backend mandou.
 */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${API_URL}${path}`, init)
  } catch {
    throw new ApiError(
      0,
      'Não foi possível falar com o servidor. Ele está rodando?'
    )
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new ApiError(
      response.status,
      body?.message ?? `Erro ${response.status} na requisição.`
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export function postJson<T>(path: string, body: unknown) {
  return api<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
