import { Inject, Injectable } from "@nestjs/common"
import { CustomPrismaService } from "nestjs-prisma"
import { ExtendedPrismaClient } from "src/prisma/prisma.extension"

@Injectable()
export class TagsService {
	constructor(
		@Inject("PrismaService")
		private readonly prismaService: CustomPrismaService<ExtendedPrismaClient>,
	) {}

	create = async (createTagDto: any, userID: string) => {
		return {}
	}

	findAll = async (
		userID: string,
		query: string | undefined,
	): Promise<any[]> => {
		return []
	}

	findOne = async (id: string) => {
		return {}
	}

	findOneByTitleAndUser = async (title: string, userID: string) => {
		return {}
	}

	update = async (tag: any, updateTagDto: any) => {
		return {}
	}

	upsertMany = async (dtos: any[], userID: string) => {
		return []
	}

	remove = async (tag: any) => {
		return {}
	}
}
