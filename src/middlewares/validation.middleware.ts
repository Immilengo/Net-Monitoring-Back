import { ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '@errors/app-error';

export const validationMiddleware =
  (schema: ZodSchema, source: 'body' | 'query' = 'body') =>
  (req: Request, _res: Response, next: NextFunction) => {
    const data = source === 'query' ? req.query : req.body;

    // guard: body ausente ou Content-Type errado
    if (source === 'body' && (data === undefined || data === null)) {
      return next(new AppError('Request body ausente ou Content-Type inválido', 400));
    }

    const result = schema.safeParse(data);
    if (!result.success) {
      const messages = result.error.errors.map((e) => e.message).join(', ');
      return next(new AppError(messages, 400));
    }

    next();
  };