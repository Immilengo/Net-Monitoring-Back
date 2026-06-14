import { ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '@errors/app-error';

export const validationMiddleware =
  (schema: ZodSchema, source: 'body' | 'query' = 'body') =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(source === 'query' ? req.query : req.body);
    if (!result.success) {
      const messages = result.error.errors.map((e) => e.message).join(', ');
      throw new AppError(messages, 400);
    }
    next();
  };