// src/common/exceptions/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import {CustomLogger} from "../loggers/custom.logger.service";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    constructor(private readonly logger: CustomLogger) {}

    catch(exception: any, host: ArgumentsHost) {
        const response = host.switchToHttp().getResponse();
        const status = exception.status || 500;
        const message = exception.message || 'Internal server error';

        this.logger.logError(exception);

        response.status(status).json({
            statusCode: status,
            message: message,
        });
    }
}
