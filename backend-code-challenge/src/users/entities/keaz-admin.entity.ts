import { ApiProperty, PickType } from "@nestjs/swagger"
import { Expose, Type } from "class-transformer"
import {
	UserWithActivated,
	UserWithContactCount,
} from "src/users/entities/keaz-user.entity"

class UserCount {
	@ApiProperty({
		required: true,
	})
	@Expose()
	users!: number
}

export class Admin extends PickType(UserWithActivated, [
	"companyAvatarUrl",
	"companyName",
	"email",
	"firstName",
	"lastName",
	"activated",
	"createdAt",
	"id",
	"role",
]) {
	@ApiProperty({
		required: false,
		type: UserCount,
	})
	@Type(() => UserCount)
	@Expose()
	_count?: UserCount

	@ApiProperty({
		isArray: true,
		type: () => UserWithContactCount,
		required: false,
	})
	@Type(() => UserWithContactCount)
	@Expose()
	users?: UserWithContactCount[]
}

export enum AdminSortings {
	CompanyName = "companyName",
	Name = "lastName",
}
