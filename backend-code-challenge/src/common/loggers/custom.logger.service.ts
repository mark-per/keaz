// src/common/logging/my-custom.logger.service.ts
import { Logger, Injectable } from '@nestjs/common';

@Injectable()
export class CustomLogger extends Logger {
    logRequest(req: any) {
        const { method, url, headers, body } = req;

        // Log the request details, including the body
        this.log(`Request: ${method} ${url}`, {
            body,
        });
    }

    logResponse(res: any) {
        const { statusCode, statusMessage } = res;
        this.log(`Response: ${statusCode} - ${statusMessage}`);
    }

    logError(error: Error) {
        this.error(`Error: ${error.message}`, error.stack);
    }

    logCustomMessage(message: string) {
        this.log(message);
    }
}
