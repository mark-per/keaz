import { ApiProperty } from "@nestjs/swagger"
import { Expose, Type } from "class-transformer"
import { Contact } from "../../contacts/entities/contact.entity"
import { Tag } from "../../tags/entities/tag.entity"
import { User } from "../../users/entities/user.entity"

export class Group {
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
		type: Boolean,
		required: true,
	})
	@Expose()
	isInclusive!: boolean

	@ApiProperty({
		type: () => User,
		required: false,
	})
	@Type(() => User)
	@Expose()
	byUser?: User

	@ApiProperty({
		isArray: true,
		type: () => Contact,
		required: false,
	})
	@Type(() => Contact)
	@Expose()
	contacts?: Contact[]

	@ApiProperty({
		isArray: true,
		type: () => Tag,
		required: false,
	})
	@Type(() => Tag)
	@Expose()
	tags?: Tag[]
}
