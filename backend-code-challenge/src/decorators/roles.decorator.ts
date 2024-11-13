import { SetMetadata } from "@nestjs/common"
import { $Enums } from "@prisma/client"

export const ROLES_KEY = "roles"
export const Admin = () =>
	SetMetadata(ROLES_KEY, [$Enums.UserRole.Admin, $Enums.UserRole.SuperAdmin])
export const SuperAdmin = () =>
	SetMetadata(ROLES_KEY, [$Enums.UserRole.SuperAdmin])
