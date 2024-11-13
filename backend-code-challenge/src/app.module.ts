import { Module } from "@nestjs/common"
import { APP_GUARD } from "@nestjs/core"
import { CustomPrismaModule } from "nestjs-prisma"
import { ContactsModule } from "./contacts/contacts.module"
import { RolesGuard } from "./decorators/roles.guard"
import { GroupsModule } from "./groups/groups.module"
import { extendedPrismaClient } from "./prisma/prisma.extension"
import { TagsModule } from "./tags/tags.module"

@Module({
	imports: [
		CustomPrismaModule.forRootAsync({
			name: "PrismaService",
			isGlobal: true,
			useFactory: () => {
				return extendedPrismaClient
			},
		}),
		ContactsModule,
		GroupsModule,
		TagsModule,
	],
	controllers: [],
	providers: [
		{
			provide: APP_GUARD,
			useClass: RolesGuard,
		},
	],
})
export class AppModule {}
