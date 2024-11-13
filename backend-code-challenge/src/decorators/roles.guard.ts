import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { ROLES_KEY } from "./roles.decorator"

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate = async (context: ExecutionContext): Promise<boolean> => {
		const requiredRoles = this.reflector.getAllAndOverride(ROLES_KEY, [
			context.getHandler(),
			context.getClass(),
		])

		if (!requiredRoles) {
			return true
		}

		const user = context.switchToHttp().getRequest().user
		return user && requiredRoles.includes(user.role)
	}
}
