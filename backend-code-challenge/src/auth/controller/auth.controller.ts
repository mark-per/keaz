import {Controller, Post, Body, Request, UseGuards, UnauthorizedException, Get} from '@nestjs/common';
import {AuthService} from '../service/auth.service';
import {JwtAuthGuard} from '../jwt-auth.guard';
import {ApiBody, ApiTags} from "@nestjs/swagger";
import {LoginDto} from "../dto/login.dto";
import {User} from "../../decorators/user.decorator";

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {
    }

    @ApiBody({type: LoginDto})
    @Post('login')
    async login(@Body() body: { email: string; password: string }) {
        const user = await this.authService.validateUser(body.email, body.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user);
    }
}
