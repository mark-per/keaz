import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET || 'yourSecretKey',
            ignoreExpiration: false,
        });
    }

    async validate(payload: any) {
        if (!payload || !payload.id || !payload.email) {
            throw new UnauthorizedException('Invalid token payload');
        }
        return { id: payload.id, email: payload.email, role: payload.role };
    }
}
