import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class CreateUserDto {

    @ApiProperty({ example: 'John', description: 'First name of the user' })
    @IsString()
    firstName: string;

    @ApiProperty({ example: 'Doe', description: 'Last name of the user' })
    @IsString()
    lastName: string;

    @ApiProperty({ example: 'johndoe@example.com', description: 'Email of the user' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'strongpassword123', description: 'User password' })
    @IsString()
    password: string;

    @ApiProperty({ example: 'user123', description: 'Unique user code', required: false })
    @IsOptional()
    @IsString()
    code?: string;

    @ApiProperty({ example: 'Acme Corporation', description: 'Company name', required: false })
    @IsOptional()
    @IsString()
    companyName?: string;

    @ApiProperty({ example: 'https://example.com/avatar.png', description: 'URL to company avatar', required: false })
    @IsOptional()
    @IsString()
    companyAvatarUrl?: string;

    @ApiProperty({ example: '+15555555555', description: 'Phone number', required: false })
    @IsOptional()
    @IsString()
    fon?: string;

    @ApiProperty({ example: UserRole.User, description: 'Role of the user', enum: UserRole, required: false })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @ApiProperty({ example: 'random-reset-token', description: 'Reset token for password recovery', required: false })
    @IsOptional()
    @IsString()
    resetToken?: string;

    @ApiProperty({ example: 'activation-token', description: 'Activation token for account activation', required: false })
    @IsOptional()
    @IsString()
    activationToken?: string;

    @ApiProperty({ example: '2024-11-14T12:00:00Z', description: 'Archived date if the user is deactivated', required: false })
    @IsOptional()
    archived?: Date;
}
