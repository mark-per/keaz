import { Module } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { CustomPrismaModule } from "nestjs-prisma";
import { ContactsModule } from "./contacts/contacts.module";
import { RolesGuard } from "./decorators/roles.guard";
import { GroupsModule } from "./groups/groups.module";
import { extendedPrismaClient } from "./prisma/prisma.extension";
import { TagsModule } from "./tags/tags.module";
import { UsersModule } from "./users/users.module";
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from "./auth/auth.module";
import { CustomLogger } from './common/loggers/custom.logger.service'; // Import the custom logger
import { LoggingInterceptor } from './common/interceptors/logging.interceptor'; // Import the interceptor

@Module({
	imports: [
		CustomPrismaModule.forRootAsync({
			name: "PrismaService",
			isGlobal: true,
			useFactory: () => {
				return extendedPrismaClient;
			},
		}),
		ContactsModule,
		GroupsModule,
		TagsModule,
		AuthModule,
		UsersModule,
		JwtModule.register({
			secret: process.env.JWT_SECRET || 'yourSecretKey',
			signOptions: { expiresIn: '1h' },
		}),
	],
	controllers: [],
	providers: [
		// Global Roles Guard
		{
			provide: APP_GUARD,
			useClass: RolesGuard,
		},
		// Global Logging Interceptor
		{
			provide: APP_INTERCEPTOR,
			useClass: LoggingInterceptor,
		},
		// Custom Logger Provider
		CustomLogger,
	],
})
export class AppModule {}
