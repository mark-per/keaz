import { ApiExtraModels, ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import {
	IsArray,
	IsDateString,
	IsNotEmpty,
	IsOptional,
	IsString,
	ValidateNested,
} from "class-validator"
import { ConnectGroupDto } from "../../groups/dto/connect-group.dto"
import { ConnectTagDto } from "../../tags/dto/connect-tag.dto"

export class CreateContactTagsRelationInputDto {
	@ApiProperty({
		isArray: true,
		type: ConnectTagDto,
		required: true,
	})
	@IsNotEmpty()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => ConnectTagDto)
	connect!: ConnectTagDto[]
}
export class CreateContactGroupsRelationInputDto {
	@ApiProperty({
		isArray: true,
		type: ConnectGroupDto,
		required: true,
	})
	@IsNotEmpty()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => ConnectGroupDto)
	connect!: ConnectGroupDto[]
}

@ApiExtraModels(
	ConnectTagDto,
	CreateContactTagsRelationInputDto,
	ConnectGroupDto,
	CreateContactGroupsRelationInputDto,
)
export class CreateContactDto {
	@ApiProperty({
		required: false,
		nullable: true,
	})
	@IsOptional()
	@IsString()
	countryCode?: string

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
		required: false,
		nullable: true,
	})
	@IsOptional()
	@IsString()
	lastName?: string

	@ApiProperty({
		type: "string",
		format: "date-time",
		required: false,
		nullable: true,
	})
	@IsOptional()
	@IsDateString()
	birthday?: Date

	@ApiProperty({
		type: CreateContactTagsRelationInputDto,
		required: false,
	})
	@IsOptional()
	@ValidateNested()
	@Type(() => CreateContactTagsRelationInputDto)
	tags?: CreateContactTagsRelationInputDto

	@ApiProperty({
		type: CreateContactGroupsRelationInputDto,
		required: false,
	})
	@IsOptional()
	@ValidateNested()
	@Type(() => CreateContactGroupsRelationInputDto)
	groups?: CreateContactGroupsRelationInputDto
}
