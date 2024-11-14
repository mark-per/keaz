import { IsOptional, IsEmail, IsString, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client'; // Ensure this import matches your Prisma schema

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    firstName?: string;

    @IsString()
    lastName: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    code?: string;

    @IsOptional()
    @IsString()
    companyName?: string;

    @IsOptional()
    @IsString()
    companyAvatarUrl?: string;

    @IsOptional()
    @IsString()
    fon?: string;

    @IsOptional()
    @IsEnum(UserRole) // Ensuring role is one of the defined enum values
    role?: UserRole;

    @IsOptional()
    @IsString()
    resetToken?: string;

    @IsOptional()
    @IsString()
    activationToken?: string;

    @IsOptional()
    archived?: Date;
}
