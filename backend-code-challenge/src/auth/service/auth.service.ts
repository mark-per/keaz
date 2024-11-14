import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../users/service/users.service';

interface AuthPayload {
    email: string;
    id: string;
    role: string;
}

interface LoginResponse {
    access_token: string;
    refresh_token: string;
}

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    async validateUser(email: string, pass: string): Promise<AuthPayload | null> {
        const user = await this.usersService.findByEmail(email);
        if (!user || !(await bcrypt.compare(pass, user.hash))) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const { hash, ...result } = user;
        return result as AuthPayload;
    }

    async login(user: AuthPayload): Promise<LoginResponse> {
        const payload = { email: user.email, id: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload, { expiresIn: '1h' }),
            refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' })
        };
    }
}
