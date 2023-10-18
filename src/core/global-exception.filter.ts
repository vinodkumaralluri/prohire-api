import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpStatus,
    Logger,
    HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        Logger.log(' GlobalExceptionFilter :: Enter  ');
        Logger.log(' GlobalExceptionFilter :: Error  ', exception);

        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        let statusCode =
            (exception?.getStatus && exception?.getStatus()) ||
            HttpStatus.INTERNAL_SERVER_ERROR;
        let message =
            exception.message ||
            (exception.getResponse &&
                (typeof exception.getResponse() === 'object'
                    ? (exception.getResponse() as any).message
                    : exception.getResponse()));
        let error = (exception.getResponse && exception.getResponse()) || exception;

        Logger.log(' GlobalExceptionFilter :: Exit  ');
        response.status(statusCode).send({
            status_code: statusCode,
            message: message,
            error: error,
        });
    }
}
