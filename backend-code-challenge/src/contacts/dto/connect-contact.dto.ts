import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString } from "class-validator"

export class ConnectContactDto {
	@ApiProperty({
		required: true,
	})
	@IsNotEmpty()
	@IsString()
	id!: string
}
