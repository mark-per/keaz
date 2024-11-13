import { ApiProperty, OmitType, PickType } from "@nestjs/swagger"
import { Expose, Type } from "class-transformer"
import { ContactSmall } from "../../contacts/entities/keaz-contact.entity"
import { GroupSmall } from "../../groups/entities/keaz-group.entity"
import { Tag } from "../../tags/entities/tag.entity"

export class TagCounts {
	@ApiProperty({
		required: true,
		type: Number,
	})
	@Expose()
	contacts!: number

	@ApiProperty({
		required: true,
		type: Number,
	})
	@Expose()
	groups!: number
}

export class TagMini extends PickType(Tag, ["id", "title", "color"]) {}

export class TagSmall extends PickType(Tag, ["id", "title", "color"]) {
	@ApiProperty({
		required: true,
		type: () => TagCounts,
	})
	@Type(() => TagCounts)
	@Expose()
	_count!: TagCounts
}

export class KeazTag extends OmitType(Tag, ["groups", "contacts"]) {
	@ApiProperty({
		isArray: true,
		required: true,
		type: () => GroupSmall,
	})
	@Type(() => GroupSmall)
	@Expose()
	groups!: GroupSmall[]

	@ApiProperty({
		isArray: true,
		required: true,
		type: () => ContactSmall,
	})
	@Type(() => ContactSmall)
	@Expose()
	contacts!: ContactSmall[]
}

export enum LabelSortings {
	Title = "title",
}
