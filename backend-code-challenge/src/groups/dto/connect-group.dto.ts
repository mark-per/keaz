import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString } from "class-validator"

export class ConnectGroupDto {
	@ApiProperty({
		required: true,
	})
	@IsNotEmpty()
	@IsString()
	id!: string
}
