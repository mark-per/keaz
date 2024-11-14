import { Logger, Module } from "@nestjs/common"
import { GroupsModule } from "../groups/groups.module"
import { ContactsController } from "./controller/contacts.controller"
import { ContactsService } from "./service/contacts.service"
import { TagsModule } from "../tags/tags.module";
import {CustomLogger} from "../common/loggers/custom.logger.service";
import {ContactValidationService} from "./service/contact.validation.service";

@Module({
	imports: [GroupsModule, TagsModule],
	controllers: [ContactsController],
	providers: [ContactsService, ContactsController, CustomLogger, ContactValidationService],
	exports: [ContactsService, ContactsController],
})
export class ContactsModule {}
