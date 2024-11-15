import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { CustomLogger } from '../loggers/custom.logger.service';
import { v4 as uuid } from 'uuid'; // For correlation ID generation

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    constructor(private readonly logger: CustomLogger) {}

    catch(exception: any, host: ArgumentsHost) {
        const response = host.switchToHttp().getResponse();
        const request = host.switchToHttp().getRequest();
        const status = exception.status || 500;
        const message = exception.message || 'Internal server error';
        const correlationId = uuid(); // Generate a unique correlation ID

        const errorData = {
            correlationId,
            status,
            message,
            stack: exception.stack,
            url: request.url,
            method: request.method,
        };

        // Log the error with correlation ID
        this.logger.logError(errorData, correlationId);

        // Respond to the client
        response.status(status).json({
            statusCode: status,
            message: message,
            correlationId, // Return correlationId for traceability
        });
    }
}
