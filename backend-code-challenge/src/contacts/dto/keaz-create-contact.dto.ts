import { ApiProperty } from "@nestjs/swagger"
import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator"

export class UpsertContactDto {
	@ApiProperty({
		required: false,
		nullable: true,
	})
	@IsOptional()
	@IsString()
	email?: string

	@ApiProperty({
		required: true,
	})
	@IsNotEmpty()
	@IsString()
	fon!: string

	@ApiProperty({
		required: true,
	})
	@IsNotEmpty()
	@IsString()
	firstName!: string

	@ApiProperty({
		required: true,
	})
	@IsOptional()
	@IsString()
	lastName?: string

	@ApiProperty({
		required: false,
		nullable: true,
	})
	@IsArray()
	tags!: string[]
}

export class ContactBulkDto {
	@ApiProperty({
		required: false,
		nullable: true,
	})
	@IsArray()
	contactIDs!: string[]
}
