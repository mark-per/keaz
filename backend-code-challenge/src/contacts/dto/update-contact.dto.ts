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

export class UpdateContactTagsRelationInputDto {
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
export class UpdateContactGroupsRelationInputDto {
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
	UpdateContactTagsRelationInputDto,
	ConnectGroupDto,
	UpdateContactGroupsRelationInputDto,
)
export class UpdateContactDto {
	@ApiProperty({
		required: false,
		nullable: true,
	})
	@IsOptional()
	@IsString()
	countryCode?: string | null

	@ApiProperty({
		required: false,
		nullable: true,
	})
	@IsOptional()
	@IsString()
	email?: string | null

	@ApiProperty({
		required: false,
	})
	@IsOptional()
	@IsString()
	fon?: string

	@ApiProperty({
		required: false,
	})
	@IsOptional()
	@IsString()
	firstName?: string

	@ApiProperty({
		required: false,
		nullable: true,
	})
	@IsOptional()
	@IsString()
	lastName?: string | null

	@ApiProperty({
		type: "string",
		format: "date-time",
		required: false,
		nullable: true,
	})
	@IsOptional()
	@IsDateString()
	birthday?: Date | null

	@ApiProperty({
		default: "",
		required: false,
	})
	@IsOptional()
	@IsString()
	notes?: string

	@ApiProperty({
		required: false,
		type: UpdateContactTagsRelationInputDto,
	})
	@IsOptional()
	@ValidateNested()
	@Type(() => UpdateContactTagsRelationInputDto)
	tags?: UpdateContactTagsRelationInputDto

	@ApiProperty({
		required: false,
		type: UpdateContactGroupsRelationInputDto,
	})
	@IsOptional()
	@ValidateNested()
	@Type(() => UpdateContactGroupsRelationInputDto)
	groups?: UpdateContactGroupsRelationInputDto
}
