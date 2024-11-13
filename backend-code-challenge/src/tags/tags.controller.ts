import {
	Body,
	Controller,
	Delete,
	Get,
	Logger,
	Param,
	Patch,
	Post,
	Query,
} from "@nestjs/common"
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger"
import { User as UserModel } from "@prisma/client"
import { User, UserId } from "../decorators/user.decorator"
import { TagsService } from "./tags.service"

@ApiBearerAuth()
@ApiTags("tags")
@Controller("tags")
export class TagsController {
	constructor(
		private readonly tagsService: TagsService,
		private readonly logger: Logger,
	) {}

	@Post()
	async createTag(
		@Body() createTagDto: any,
		@User() user: UserModel,
	): Promise<any> {
		return {}
	}

	@Get()
	async findAllTags(
		@Query() query: { search?: string; user?: string } | undefined,
		@UserId() userID: string,
	): Promise<any[]> {
		return []
	}

	@Get(":id")
	async findOneTag(
		@Param("id") id: string,
		@User() user: UserModel,
	): Promise<any> {
		return {}
	}

	@Patch(":id")
	async updateTag(
		@Param("id") id: string,
		@Body() updateTagDto: any,
		@User() user: UserModel,
	): Promise<any> {
		return {}
	}

	@Delete(":id")
	async removeTag(
		@Param("id") id: string,
		@User() user: UserModel,
	): Promise<any> {
		return {}
	}
}
