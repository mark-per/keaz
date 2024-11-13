import { ApiProperty } from "@nestjs/swagger"
import { Expose, Type } from "class-transformer"
import { IsArray, IsDateString, IsNotEmpty, IsOptional } from "class-validator"
import { User } from "./user.entity"

class DashboardContacts {
	@ApiProperty({
		required: true,
		type: Number,
	})
	@Expose()
	count!: number

	@ApiProperty({
		required: true,
		isArray: true,
		type: Number,
	})
	@Expose()
	last7Days!: number[]

	@ApiProperty({
		required: true,
		type: Number,
	})
	@Expose()
	weeklyTrend!: number
}

export class ContactCount {
	@ApiProperty({
		required: true,
	})
	@Expose()
	contacts!: number
}

export class UserWithActivated extends User {
	@ApiProperty({
		required: true,
	})
	@Expose()
	activated!: boolean
}

export class UserWithContactCount extends UserWithActivated {
	@ApiProperty({
		required: true,
		type: ContactCount,
	})
	@Type(() => ContactCount)
	@Expose()
	_count!: ContactCount

	@ApiProperty({
		required: true,
		type: Boolean,
	})
	@Expose()
	hasShopify!: boolean
}

export class UserWithTemplates extends UserWithContactCount {
	@ApiProperty({
		required: true,
		type: Boolean,
	})
	@Expose()
	allTemplatesVerified!: boolean

	@ApiProperty({
		required: true,
		type: Boolean,
	})
	@Expose()
	bspAccountIssues!: boolean
}

export class Stats {
	@ApiProperty({
		required: true,
		type: Number,
	})
	@Expose()
	contactCount!: number
}

export class Todos {
	@ApiProperty({
		required: true,
		type: Boolean,
	})
	@Expose()
	crm!: boolean

	@ApiProperty({
		required: true,
		type: Boolean,
	})
	@Expose()
	dialog360!: boolean

	@ApiProperty({
		required: true,
		type: Boolean,
	})
	@Expose()
	whatsappProfile!: boolean
}

export class DashboardData {
	@ApiProperty({
		required: false,
		type: Todos,
	})
	@Type(() => Todos)
	@Expose()
	todos?: Todos

	@ApiProperty({
		required: false,
		type: Stats,
	})
	@Type(() => Stats)
	@Expose()
	stats?: Stats

	@ApiProperty({
		required: true,
		type: () => UserWithActivated,
	})
	@Type(() => UserWithActivated)
	@Expose()
	user!: UserWithActivated
}

export class CSVCreateContactDto {
	@ApiProperty({
		type: String,
		required: true,
	})
	@IsNotEmpty()
	@Expose()
	fon!: string

	@ApiProperty({
		type: String,
		required: true,
	})
	@IsNotEmpty()
	@Expose()
	firstName!: string

	@ApiProperty({
		type: String,
		required: false,
	})
	@IsOptional()
	@Expose()
	lastName?: string

	@ApiProperty({
		type: "string",
		format: "date-time",
		required: true,
	})
	@IsNotEmpty()
	@IsDateString()
	@Type(() => Date)
	@Expose()
	createdAt!: Date

	@ApiProperty({
		type: Number,
		required: true,
		isArray: true,
	})
	@IsArray()
	@IsNotEmpty()
	@Expose()
	tags!: number[]
}

export class CSVImportTag {
	@ApiProperty({
		required: true,
		type: Number,
	})
	@Expose()
	index!: number

	@ApiProperty({
		required: true,
		type: String,
	})
	@Expose()
	title!: string
}

export class CSVImportDto {
	@ApiProperty({
		required: true,
		isArray: true,
		type: () => CSVCreateContactDto,
	})
	@IsNotEmpty()
	@Type(() => CSVCreateContactDto)
	@Expose()
	contacts!: CSVCreateContactDto[]

	@ApiProperty({
		required: true,
		isArray: true,
		type: () => CSVImportTag,
	})
	@IsNotEmpty()
	@Type(() => CSVImportTag)
	@Expose()
	tags!: CSVImportTag[]

	@ApiProperty({
		required: false,
		type: String,
	})
	@IsOptional()
	@Expose()
	dialogueID?: string
}

export class CSVImportStatistics {
	@ApiProperty({
		required: true,
		type: Number,
	})
	@Expose()
	createdContactCount!: number

	@ApiProperty({
		required: true,
		type: Number,
	})
	@Expose()
	sentDialogueCount!: number
}

export enum CustomersSortings {
	CompanyName = "companyName",
	Name = "lastName",
	Limit = "bspMessageLimit",
	ContactCount = "contacts._count",
}
