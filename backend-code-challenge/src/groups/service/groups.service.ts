import { Inject, Injectable, forwardRef } from "@nestjs/common"
import { CustomPrismaService } from "nestjs-prisma"
import { ContactsService } from "../../contacts/service/contacts.service"
import { ExtendedPrismaClient } from "src/prisma/prisma.extension"
import { GetPaginateQuery, Order } from "../../common/pagination/pagination"

@Injectable()
export class GroupsService {
	constructor(
		@Inject(forwardRef(() => ContactsService))
		private contactsService: ContactsService,
		@Inject("PrismaService")
		private readonly prismaService: CustomPrismaService<ExtendedPrismaClient>,
	) {}

	create = async (createGroupDto: any, userID: string) => {
		return {}
	}

	findAll = async ({
		userID,
		limit,
		cursorID,
		search,
		sort,
		order = Order.Desc,
		filter,
	}: {
		userID: string
	} & GetPaginateQuery<any>) => {
		return []
	}

	findForSend = async (userID: string, search?: string) => {
		return {}
	}

	findOne = async (id: string) => {
		return {}
	}

	findOneByTitle = async (title: string, byUserID: string) => {
		return {}
	}

	findGroupsForTags = async (tagIds: string[]) => {
		return []
	}

	update = async (id: string, updateGroupDto: any, oldBehaviour: boolean) => {
		return {}
	}

	remove = async (id: string) => {
		return {}
	}
}
