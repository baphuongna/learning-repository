import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  details?: any;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: ErrorResponse = {
      statusCode: status,
      message: 'Đã xảy ra lỗi server',
      error: 'Internal Server Error',
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        errorResponse = {
          statusCode: status,
          message: exceptionResponse,
          error: exception.name,
        };
      } else if (typeof exceptionResponse === 'object') {
        errorResponse = {
          ...errorResponse,
          ...(exceptionResponse as object),
          statusCode: status,
        };
      }
    } else if (exception instanceof Error) {
      errorResponse = {
        statusCode: status,
        message: exception.message,
        error: exception.name,
      };

      // Log error trong development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error:', exception);
        errorResponse.details = exception.stack;
      }
    }

    response.status(status).json(errorResponse);
  }
}
