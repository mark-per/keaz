import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
} from "@nestjs/common"
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger"

import { User as UserModel } from "@prisma/client"
import { GetPaginateQuery, Paginate } from "../utils/pagination"
import { User } from "../decorators/user.decorator"
import { GroupsService } from "./groups.service"

@ApiBearerAuth()
@ApiTags("groups")
@Controller("groups")
export class GroupsController {
	constructor(private readonly groupsService: GroupsService) {}

	@Post()
	async createGroup(
		@Body() createGroupDto: any,
		@User() user: UserModel,
	): Promise<any> {
		return {}
	}

	@Get()
	async findAllGroups(
		@Query()
		query: GetPaginateQuery<any>,
		@User("id") userID: string,
	): Promise<Paginate<any>> {
		return Paginate.create([], query.limit)
	}

	@Get("/send")
	async findAllGroupsForBroadcast(
		@User("id") userID: string,
		@Query() query: { search?: string } | undefined,
	): Promise<any[]> {
		return []
	}

	@Get(":id")
	async findOneGroup(
		@Param("id") id: string,
		@User() user: UserModel,
	): Promise<any> {
		return {}
	}

	@Patch(":id")
	async updateGroup(
		@Param("id") id: string,
		@Body() updateGroupDto: any,
		@User() user: UserModel,
	): Promise<any> {
		return {}
	}

	@Delete(":id")
	async removeGroup(
		@Param("id") id: string,
		@User() user: UserModel,
	): Promise<void> {}
}
