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
                winston.format.json() // Use JSON format for structured logging
            ),
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.prettyPrint({ colorize: true }) // Pretty print for console
                    ),
                }),
                new winston.transports.File({
                    filename: 'logs/app.log',
                }),
            ],
        });
    }

    /**
     * Log HTTP request details as JSON.
     */
    logRequest(data: Record<string, any>, correlationId: string): void {
        this.logger.info({
            type: 'request',
            message: `Request received: ${data.method} ${data.url}`,
            correlationId,
            data,
        });
    }

    /**
     * Log HTTP response details as JSON.
     */
    logResponse(data: Record<string, any>, correlationId: string): void {
        this.logger.info({
            type: 'response',
            message: `Response sent: ${data.statusCode}`,
            correlationId,
            data,
        });
    }

    /**
     * Log errors as JSON.
     */
    logError(errorData: Record<string, any>, correlationId: string): void {
        this.logger.error({
            type: 'error',
            message: `Error occurred`,
            correlationId,
            data: errorData,
        });
    }

    /**
     * General log methods for NestJS compatibility.
     */
    log(message: string): void {
        this.logger.info({ type: 'log', message });
    }

    error(message: string, trace?: string): void {
        this.logger.error({ type: 'error', message, trace });
    }

    warn(message: string): void {
        this.logger.warn({ type: 'warning', message });
    }

    debug(message: string): void {
        this.logger.debug({ type: 'debug', message });
    }

    verbose(message: string): void {
        this.logger.verbose({ type: 'verbose', message });
    }
}
