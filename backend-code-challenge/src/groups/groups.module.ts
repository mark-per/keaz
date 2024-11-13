import { Module, forwardRef } from "@nestjs/common"
import { ContactsModule } from "../contacts/contacts.module"
import { GroupsController } from "./groups.controller"
import { GroupsService } from "./groups.service"

@Module({
	imports: [forwardRef(() => ContactsModule)],
	controllers: [GroupsController],
	providers: [GroupsService, GroupsController],
	exports: [GroupsService, GroupsController],
})
export class GroupsModule {}
