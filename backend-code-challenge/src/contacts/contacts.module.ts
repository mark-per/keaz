import { Logger, Module } from "@nestjs/common"
import { GroupsModule } from "../groups/groups.module"
import { ContactsController } from "./contacts.controller"
import { ContactsService } from "./contacts.service"
import { TagsModule } from "../tags/tags.module";

@Module({
	imports: [GroupsModule, TagsModule],
	controllers: [ContactsController],
	providers: [ContactsService, ContactsController, Logger],
	exports: [ContactsService, ContactsController],
})
export class ContactsModule {}
