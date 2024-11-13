import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString } from "class-validator"

export class ConnectTagDto {
	@ApiProperty({
		required: true,
	})
	@IsNotEmpty()
	@IsString()
	id!: string
}
