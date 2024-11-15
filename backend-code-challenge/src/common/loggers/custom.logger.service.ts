import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { Logger } from 'winston';

@Injectable()
export class CustomLogger implements LoggerService {
    private logger: Logger;

    constructor() {
        // Configure Winston logger
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.simple()
                    ),
                }),
                new winston.transports.File({
                    filename: 'logs/app.log',
                }),
            ],
        });
    }

    /**
     * Log HTTP request details.
     */
    logRequest(data: Record<string, any>, correlationId: string): void {
        this.logger.info(`Request: ${data.method} ${data.url}`, {
            ...data,
            correlationId,
        });
    }

    /**
     * Log HTTP response details.
     */
    logResponse(data: Record<string, any>, correlationId: string): void {
        this.logger.info(`Response: ${data.statusCode}`, {
            ...data,
            correlationId,
        });
    }

    /**
     * Log errors.
     */
    logError(errorData: Record<string, any>, correlationId: string): void {
        this.logger.error(`Error occurred`, {
            ...errorData,
            correlationId,
        });
    }

    /**
     * General log methods for NestJS compatibility.
     */
    log(message: string): void {
        this.logger.info(message);
    }

    error(message: string, trace?: string): void {
        this.logger.error(message, { trace });
    }

    warn(message: string): void {
        this.logger.warn(message);
    }

    debug(message: string): void {
        this.logger.debug(message);
    }

    verbose(message: string): void {
        this.logger.verbose(message);
    }
}
