import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log the error
    logger.error('Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            isOperational: err.isOperational
        });
    }

    // Validation Errors (Zod) - if leaked
    if (err.name === 'ZodError') {
        return res.status(400).json({
            status: 'fail',
            message: 'Validation Error',
            errors: err.errors
        });
    }

    // Generic Error
    res.status(err.statusCode).json({
        status: 'error',
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};
