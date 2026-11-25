/*
 * Body parser errors are logged by their type only: their message quotes part of the request body,
 * and request content must never reach the logs.
 */
import type { ErrorRequestHandler, RequestHandler } from 'express';

export const notFound: RequestHandler = (_request, response) => {
  response
    .status(404)
    .json({ code: 'NOT_FOUND', message: 'The requested resource was not found.' });
};

export const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
  const bodyError =
    typeof error === 'object' && error !== null && 'type' in error ? error.type : undefined;
  process.stderr.write(
    `${JSON.stringify({
      level: 'error',
      requestId: request.requestId,
      message: bodyError ?? (error instanceof Error ? error.message : 'Unknown error'),
    })}\n`,
  );
  if (bodyError === 'entity.parse.failed') {
    response.status(400).json({ code: 'INVALID_REQUEST', message: 'The request is invalid.' });
    return;
  }
  if (bodyError === 'entity.too.large') {
    response
      .status(413)
      .json({ code: 'PAYLOAD_TOO_LARGE', message: 'The request body is too large.' });
    return;
  }
  response.status(500).json({ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' });
};
