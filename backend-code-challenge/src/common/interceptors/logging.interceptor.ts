import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { CustomLogger } from '../loggers/custom.logger.service';
import { v4 as uuid } from 'uuid'; // For correlation ID generation

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    constructor(private readonly logger: CustomLogger) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const httpContext = context.switchToHttp();
        const request = httpContext.getRequest();
        const response = httpContext.getResponse();
        const method = request.method;
        const url = request.url;
        const correlationId = uuid();

        const logRequestData = {
            correlationId,
            method,
            url,
            headers: request.headers,
            body: request.body,
        };

        this.logger.logRequest(logRequestData, correlationId);

        const startTime = Date.now();

        return next.handle().pipe(
            tap((data) => {
                const duration = Date.now() - startTime;
                const logResponseData = {
                    correlationId,
                    statusCode: response.statusCode,
                    data,
                    duration,
                };
                this.logger.logResponse(logResponseData, correlationId);
            }),
            catchError((error) => {
                const duration = Date.now() - startTime;
                const logErrorData = {
                    correlationId,
                    message: error.message,
                    stack: error.stack,
                    duration,
                };
                this.logger.logError(logErrorData, correlationId);
                throw error; // Rethrow to propagate the error
            }),
        );
    }
}
