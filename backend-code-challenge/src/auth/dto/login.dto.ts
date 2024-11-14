import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ description: 'The email of the user', example: 'johndoe@example.com' })
    email: string;

    @ApiProperty({ description: 'The password of the user', example: 'password123' })
    password: string;
}
