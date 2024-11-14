import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { Logger } from 'winston';

@Injectable()
export class CustomLogger implements LoggerService {
    private logger: Logger;

    constructor() {
        // Setting up winston logger to log to both console and file
        this.logger = winston.createLogger({
            level: 'info',
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.simple(),
                    ),
                }),
                new winston.transports.File({
                    filename: 'logs/app.log',
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.json(),
                    ),
                }),
            ],
        });
    }

    // Log request details
    logRequest(req: any) {
        const { method, url, headers, body } = req;
        const logData = {
            method,
            url,
            headers,
            body, // You can choose to sanitize or remove sensitive data here
        };

        this.logger.info(`Request: ${method} ${url}`, logData);
    }

    // Log response details
    logResponse(res: any) {
        const { statusCode, statusMessage } = res;
        this.logger.info(`Response: ${statusCode} - ${statusMessage}`, {
            statusCode,
            statusMessage,
        });
    }

    // Log error details
    logError(error: Error) {
        this.logger.error(`Error: ${error.message}`, {
            message: error.message,
            stack: error.stack,
        });
    }

    // Log custom messages
    logCustomMessage(message: string) {
        this.logger.info(message);
    }

    // Define methods required by LoggerService (if using NestJS's built-in logger service)
    log(message: string) {
        this.logger.info(message);
    }

    error(message: string, trace: string) {
        this.logger.error(message, { trace });
    }

    warn(message: string) {
        this.logger.warn(message);
    }

    debug(message: string) {
        this.logger.debug(message);
    }

    verbose(message: string) {
        this.logger.verbose(message);
    }
}
