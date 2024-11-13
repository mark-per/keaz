import { ApiProperty, OmitType, PickType } from "@nestjs/swagger"
import { Expose, Type } from "class-transformer"
import {
	ContactSmall,
	ContactWithTagsAndGroups,
} from "../../contacts/entities/keaz-contact.entity"
import { Group } from "../../groups/entities/group.entity"
import { TagSmall } from "../../tags/entities/keaz-tag.entity"
import { ContactCount } from "../../users/entities/keaz-user.entity"

export class GroupSmall extends PickType(Group, ["id", "title"]) {}

export class DashboardGroup extends GroupSmall {
	@ApiProperty({
		required: true,
		type: Number,
	})
	@Expose()
	contactCount!: number
}

export class ListGroup extends OmitType(Group, ["contacts", "tags"]) {
	@ApiProperty({
		isArray: true,
		required: true,
		type: () => ContactSmall,
	})
	@Type(() => ContactSmall)
	@Expose()
	contacts!: ContactSmall[]

	@ApiProperty({
		isArray: true,
		required: true,
		type: () => TagSmall,
	})
	@Type(() => TagSmall)
	@Expose()
	tags!: TagSmall[]
}

export class SendGroup extends PickType(Group, ["id", "title"]) {
	@ApiProperty({
		isArray: true,
		required: true,
		type: () => ContactSmall,
	})
	@Type(() => ContactSmall)
	@Expose()
	contacts!: ContactSmall[]

	@ApiProperty({
		required: true,
		type: ContactCount,
	})
	@Type(() => ContactCount)
	@Expose()
	_count!: ContactCount
}

export class GroupWithTags extends PickType(Group, [
	"id",
	"title",
	"isInclusive",
]) {
	@ApiProperty({
		isArray: true,
		required: true,
		type: () => TagSmall,
	})
	@Type(() => TagSmall)
	@Expose()
	tags!: TagSmall[]

	@ApiProperty({
		required: true,
		type: ContactCount,
	})
	@Type(() => ContactCount)
	@Expose()
	_count!: ContactCount
}

export class GroupWithContactsAndTags extends GroupWithTags {
	@ApiProperty({
		isArray: true,
		required: true,
		type: () => ContactWithTagsAndGroups,
	})
	@Type(() => ContactWithTagsAndGroups)
	@Expose()
	contacts!: ContactWithTagsAndGroups[]
}

export enum GroupSortings {
	Title = "title",
	Contacts = "contacts._count",
}
