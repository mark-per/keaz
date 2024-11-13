import { ApiProperty } from "@nestjs/swagger"
import { UserRole } from "@prisma/client"
import { Expose } from "class-transformer"

export class User {
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
	email!: string

	@ApiProperty({
		type: String,
		required: true,
	})
	@Expose()
	firstName!: string

	@ApiProperty({
		type: String,
		required: true,
	})
	@Expose()
	lastName!: string

	@ApiProperty({
		required: false,
		nullable: true,
		type: String,
	})
	@Expose()
	code!: string | null

	@ApiProperty({
		required: false,
		nullable: true,
		type: String,
	})
	@Expose()
	companyName!: string | null

	@ApiProperty({
		required: false,
		nullable: true,
		type: String,
	})
	@Expose()
	companyAvatarUrl!: string | null

	@ApiProperty({
		required: false,
		nullable: true,
		type: String,
	})
	@Expose()
	fon!: string | null

	@ApiProperty({
		type: "string",
		format: "date-time",
		required: false,
	})
	@Expose()
	archived!: Date | null

	@ApiProperty({
		enum: UserRole,
		type: () => UserRole,
		required: true,
	})
	@Expose()
	role!: UserRole
}
