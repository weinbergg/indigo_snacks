import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';

export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction
) {
  if (error instanceof ZodError) {
    response.status(400).json({
      success: false,
      error: {
        message: error.issues[0]?.message || 'Ошибка валидации запроса.'
      }
    });
    return;
  }

  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      console.error('AppError', {
        details: error.details,
        message: error.message,
        statusCode: error.statusCode
      });
    }

    response.status(error.statusCode).json({
      success: false,
      error: {
        message: error.message,
        details: error.details
      }
    });
    return;
  }

  console.error(error);

  response.status(500).json({
    success: false,
    error: {
      message: 'Внутренняя ошибка сервера.'
    }
  });
}
