import { ApiProperty } from "@nestjs/swagger"

export class ContactDto {
	@ApiProperty({
		required: false,
	})
	id!: string

	@ApiProperty({
		type: "string",
		format: "date-time",
		required: false,
	})
	createdAt!: Date

	@ApiProperty({
		type: "string",
		format: "date-time",
		required: false,
	})
	updatedAt!: Date

	@ApiProperty({
		required: false,
		nullable: true,
	})
	countryCode!: string | null

	@ApiProperty({
		required: false,
		nullable: true,
	})
	email!: string | null

	@ApiProperty({
		required: false,
	})
	fon!: string

	@ApiProperty({
		required: false,
	})
	firstName!: string

	@ApiProperty({
		required: false,
		nullable: true,
	})
	lastName!: string | null

	@ApiProperty({
		type: "string",
		format: "date-time",
		required: false,
		nullable: true,
	})
	birthday!: Date | null

	@ApiProperty({
		required: false,
	})
	notes!: string

	@ApiProperty({
		required: false,
	})
	active!: boolean
}
