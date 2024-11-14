import { Logger, Module } from "@nestjs/common"
import { GroupsModule } from "../groups/groups.module"
import { ContactsController } from "./contacts.controller"
import { ContactsService } from "./contacts.service"
import { TagsModule } from "../tags/tags.module";
import {CustomLogger} from "../common/loggers/custom.logger.service";

@Module({
	imports: [GroupsModule, TagsModule],
	controllers: [ContactsController],
	providers: [ContactsService, ContactsController, CustomLogger],
	exports: [ContactsService, ContactsController],
})
export class ContactsModule {}
