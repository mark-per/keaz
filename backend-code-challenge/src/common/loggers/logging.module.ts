import { Module } from '@nestjs/common';
import { CustomLogger } from './custom.logger.service';

@Module({
    providers: [CustomLogger],
    exports: [CustomLogger], // Export to use in other modules
})
export class LoggingModule {}
