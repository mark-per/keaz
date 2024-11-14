import { Module, forwardRef } from "@nestjs/common"
import { ContactsModule } from "../contacts/contacts.module"
import { GroupsController } from "./controller/groups.controller"
import { GroupsService } from "./service/groups.service"

@Module({
	imports: [forwardRef(() => ContactsModule)],
	controllers: [GroupsController],
	providers: [GroupsService, GroupsController],
	exports: [GroupsService, GroupsController],
})
export class GroupsModule {}
