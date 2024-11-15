import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; // Import your Prisma service
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import {User} from "../entities/user.entity";

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}

    async create(createUserDto: CreateUserDto) {
        const { password, ...userData } = createUserDto;
        const hash = await bcrypt.hash(password, 10);

        return this.prisma.user.create({
            data: {
                ...userData,
                hash, // Store the hashed password as `hash` in the database
            },
        });    }

    async findAll() {
        return this.prisma.user.findMany();
    }

    // Method to get a single user by ID
    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        return this.prisma.user.update({
            where: { id },
            data: updateUserDto,
        });
    }

    async remove(id: string) {
        return this.prisma.user.delete({ where: { id } });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }
}
