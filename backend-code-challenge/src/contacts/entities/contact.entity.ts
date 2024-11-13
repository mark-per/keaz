import { ApiProperty } from "@nestjs/swagger"
import { Expose, Type } from "class-transformer"
import { Group } from "../../groups/entities/group.entity"
import { Tag } from "../../tags/entities/tag.entity"
import { User } from "../../users/entities/user.entity"

export class Contact {
	@ApiProperty({
		type: String,
		required: true,
	})
	@Expose()
	id!: string

	@ApiProperty({
		type: "string",
		format: "date-time",
		required: true,
	})
	@Expose()
	createdAt!: Date

	@ApiProperty({
		type: "string",
		format: "date-time",
		required: true,
	})
	@Expose()
	updatedAt!: Date

	@ApiProperty({
		required: false,
		nullable: true,
		type: String,
	})
	@Expose()
	countryCode!: string | null

	@ApiProperty({
		required: false,
		nullable: true,
		type: String,
	})
	@Expose()
	email!: string | null

	@ApiProperty({
		type: String,
		required: true,
	})
	@Expose()
	fon!: string

	@ApiProperty({
		type: String,
		required: true,
	})
	@Expose()
	firstName!: string

	@ApiProperty({
		required: false,
		nullable: true,
		type: String,
	})
	@Expose()
	lastName!: string | null

	@ApiProperty({
		type: "string",
		format: "date-time",
		required: false,
		nullable: true,
	})
	@Expose()
	birthday!: Date | null

	@ApiProperty({
		type: String,
		required: true,
	})
	@Expose()
	notes!: string

	@ApiProperty({
		type: Boolean,
		required: true,
	})
	@Expose()
	active!: boolean

	@ApiProperty({
		type: () => User,
		required: false,
	})
	@Type(() => User)
	@Expose()
	byUser?: User

	@ApiProperty({
		isArray: true,
		type: () => Tag,
		required: false,
	})
	@Type(() => Tag)
	@Expose()
	tags?: Tag[]

	@ApiProperty({
		isArray: true,
		type: () => Group,
		required: false,
	})
	@Type(() => Group)
	@Expose()
	groups?: Group[]
}
