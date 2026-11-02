export class HttpError extends Error {
  readonly statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.statusCode = statusCode
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Recurso não encontrado.') {
    super(404, message)
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string) {
    super(400, message)
  }
}

export class ServiceUnavailableError extends HttpError {
  constructor(message: string) {
    super(503, message)
  }
}
