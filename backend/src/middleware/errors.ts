import type { ErrorRequestHandler, RequestHandler } from 'express';

export const notFound: RequestHandler = (_request, response) => {
  response
    .status(404)
    .json({ code: 'NOT_FOUND', message: 'The requested resource was not found.' });
};

export const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
  process.stderr.write(
    `${JSON.stringify({
      level: 'error',
      requestId: request.requestId,
      message: error instanceof Error ? error.message : 'Unknown error',
    })}\n`,
  );
  response.status(500).json({ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' });
};
