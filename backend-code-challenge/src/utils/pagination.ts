import { ApiProperty } from "@nestjs/swagger"
import { Exclude, Expose, Type } from "class-transformer"
import { IsInt, IsOptional, IsString } from "class-validator"

export class Paginate<T> {
	@ApiProperty({
		required: true,
		type: String,
		nullable: true,
	})
	@Expose()
	cursorID!: string | null

	@ApiProperty({
		required: true,
		isArray: true,
	})
	@Expose()
	data!: T[]

	static create<T extends { id: string }>(
		data: T[],
		limit: number | null | undefined,
	) {
		return {
			data,
			cursorID: data.length === (limit ?? 25) ? data[data.length - 1].id : null,
		}
	}
}

export class SuperPaginate<T> extends Paginate<T> {
	@Exclude()
	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	private type: Function

	@ApiProperty({
		required: true,
		isArray: true,
	})
	@Type((options) => {
		return (options?.newObject as SuperPaginate<T>).type
	})
	@Expose()
	data!: T[]

	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	constructor(type: Function) {
		super()

		this.type = type
	}
}

export enum Order {
	Asc = "asc",
	Desc = "desc",
}

export class GetPaginateQuery<T> {
	@ApiProperty({
		required: false,
		type: String,
		nullable: true,
	})
	@IsString()
	@IsOptional()
	search?: string | null

	@ApiProperty({
		required: false,
		nullable: true,
	})
	@IsString()
	@IsOptional()
	sort?: T | null

	@ApiProperty({
		required: false,
		nullable: true,
		enum: Order,
		type: () => Order,
	})
	@IsString()
	@IsOptional()
	order?: Order | null

	@ApiProperty({
		required: false,
		type: String,
		nullable: true,
	})
	@IsString()
	@IsOptional()
	@Type(() => String)
	cursorID?: string | null

	@ApiProperty({
		required: false,
		type: String,
		nullable: true,
	})
	@IsString()
	@IsOptional()
	@Type(() => String)
	filter?: string | null

	@ApiProperty({
		required: false,
		type: Number,
		nullable: true,
	})
	@IsInt()
	@IsOptional()
	@Type(() => Number)
	limit?: number | null
}

export const getSortCommandForSorting = (
	sort: string,
	order: string,
): Record<string, unknown> => {
	const keys = sort.split(".")
	const result: Record<string, unknown> = {}
	let current = result

	for (let i = 0; i < keys.length; i++) {
		if (i === keys.length - 1) {
			current[keys[i]] = order // Assign description to last key
		} else {
			current[keys[i]] = current[keys[i]] || {} // Create new object if doesn't exist
			// @ts-ignore
			current = current[keys[i]] // Move to the next level
		}
	}

	return result
}

export const getPaginateCommands = (
	sort: string | null,
	order: Order | null,
	cursorID?: string | null,
	limit: number | null = 25,
):
	| {
			orderBy: Record<string, unknown> | { createdAt: Order.Desc }
			cursor?: { id: string }
			skip?: number
			take: number
	  }
	| Record<string, any> => {
	return limit === -1
		? {}
		: {
				orderBy:
					sort && order
						? [getSortCommandForSorting(sort, order), { id: Order.Desc }]
						: { createdAt: Order.Desc },
				...(cursorID && { skip: 1, cursor: { id: cursorID } }),
				take: limit,
			}
}
