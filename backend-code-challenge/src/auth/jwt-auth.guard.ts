import {ExecutionContext, Injectable, UnauthorizedException} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    // handleRequest(err, user, info, context: ExecutionContext) {
    //     if (err || !user) {
    //         throw err || new UnauthorizedException();
    //     }
    //     const request = context.switchToHttp().getRequest();
    //     request.whatIsThis = user;
    //     return user;
    // }
}
