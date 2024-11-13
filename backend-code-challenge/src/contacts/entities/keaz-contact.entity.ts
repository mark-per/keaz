import { ApiProperty, OmitType, PickType } from "@nestjs/swagger"
import { Expose, Type } from "class-transformer"
import { Contact } from "../../contacts/entities/contact.entity"

import { GroupSmall } from "../../groups/entities/keaz-group.entity"
import { TagSmall } from "../../tags/entities/keaz-tag.entity"
import { Tag } from "../../tags/entities/tag.entity"

export class ContactSmall extends PickType(Contact, [
	"id",
	"firstName",
	"lastName",
]) {}

export class ContactWithTagsAndGroups extends OmitType(Contact, [
	"tags",
	"groups",
]) {
	@ApiProperty({
		isArray: true,
		required: false,
		type: () => TagSmall,
		nullable: true,
	})
	@Type(() => TagSmall)
	@Expose()
	tags?: TagSmall[] | null

	@ApiProperty({
		isArray: true,
		required: false,
		type: () => GroupSmall,
		nullable: true,
	})
	@Type(() => GroupSmall)
	@Expose()
	groups?: GroupSmall[] | null
}

export class ContactWithTags extends Contact {
	@ApiProperty({
		isArray: true,
		required: true,
		type: () => Tag,
	})
	@Type(() => Tag)
	@Expose()
	tags!: Tag[]
}

export enum ContactsSortings {
	Name = "firstName",
	Subscribed = "whatsAppConversation.subscribed",
	CreatedAt = "createdAt",
}

export class ContactKpis {
	@ApiProperty({
		type: Number,
		required: true,
	})
	@Expose()
	contactsCount!: number

	@ApiProperty({
		type: Number,
		required: true,
	})
	@Expose()
	activeCount!: number
}
