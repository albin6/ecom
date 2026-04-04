import logger from '../utils/logger.js';
import { env } from '../config/env.js';

export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  logger.error(`[Error] ${message}`, { stack: err.stack, path: req.path });

  res.status(statusCode).json({
    message,
    stack: env.NODE_ENV === 'production' ? null : err.stack,
  });
};
