import { ApiProperty } from "@nestjs/swagger"
import { Expose, Type } from "class-transformer"
import { Contact } from "../../contacts/entities/contact.entity"
import { Group } from "../../groups/entities/group.entity"
import { User } from "../../users/entities/user.entity"

export class Tag {
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
		type: String,
		required: true,
	})
	@Expose()
	title!: string

	@ApiProperty({
		type: String,
		required: true,
	})
	@Expose()
	color!: string

	@ApiProperty({
		type: "string",
		format: "date-time",
		required: false,
		nullable: true,
	})
	@Expose()
	lastApplied!: Date | null

	@ApiProperty({
		type: String,
		required: true,
	})
	@Expose()
	byUserID!: string

	@ApiProperty({
		type: () => User,
		required: false,
	})
	@Type(() => User)
	@Expose()
	byUser?: User

	@ApiProperty({
		isArray: true,
		type: () => Group,
		required: false,
	})
	@Type(() => Group)
	@Expose()
	groups?: Group[]

	@ApiProperty({
		isArray: true,
		type: () => Contact,
		required: false,
	})
	@Type(() => Contact)
	@Expose()
	contacts?: Contact[]
}
