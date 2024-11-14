import {Inject, Injectable, forwardRef} from "@nestjs/common"
import {Contact, Prisma, Tag} from "@prisma/client"
import {parsePhoneNumberFromString} from "libphonenumber-js"
import {CustomPrismaService} from "nestjs-prisma"
import {UpsertContactDto} from "src/contacts/dto/keaz-create-contact.dto"
import {
    ContactWithTags,
    ContactsSortings,
} from "../entities/keaz-contact.entity"
import {GroupsService} from "../../groups/service/groups.service"
import {ExtendedPrismaClient} from "../../prisma/prisma.extension"
import {escapeRegExp} from "../../common/utils/escapeRegex"
import {formatFon} from "../../common/utils/formatPhonenumber"
import {
    GetPaginateQuery,
    Order,
    getPaginateCommands,
} from "../../common/pagination/pagination"
import {CreateContactDto} from "../dto/create-contact.dto"
import {UpdateContactDto} from "../dto/update-contact.dto"
import {ContactValidationService} from "./contact.validation.service";
import {buildSearchFilter, addTagsToContact, createContactInDatabase} from "./contact.heplers";
import {TagsService} from "../../tags/service/tags.service"; // Import helpers here


export type FindAllParams = {
    userID: string;
    groupID?: string;
    filter?: string;
    search?: string;
    sort?: ContactsSortings;
    order?: Order;
    cursorID?: string;
    limit?: number;
};

@Injectable()
export class ContactsService {
    constructor(
        @Inject(forwardRef(() => GroupsService))
        private readonly groupsService: GroupsService,
        @Inject("PrismaService")
        private readonly prismaService: CustomPrismaService<ExtendedPrismaClient>,
        @Inject(forwardRef(() => ContactValidationService))  // Use forwardRef here
        readonly contactValidationService: ContactValidationService,
    ) {
    }

    async create(
        dto: CreateContactDto,
        userID: string,
        include?: Prisma.ContactInclude,
    ): Promise<Contact | Prisma.ContactGetPayload<{ include: Prisma.ContactInclude }>> {
        const {fon, tags, ...rest} = dto;

        await this.contactValidationService.validatePhoneNumber(fon);
        await this.contactValidationService.checkExistingContact(fon, userID);

        const parsed = parsePhoneNumberFromString(fon.includes("+") ? fon : `+${fon}`,)
        const internationalFormat = formatFon(fon) as string
        const contact = await createContactInDatabase(rest, internationalFormat, userID, parsed.country);

        if (tags?.connect?.length) {
            await addTagsToContact(tags.connect, contact.id);
        }

        return contact;
    }

    async findAll({
                      userID,
                      limit,
                      cursorID,
                      search,
                      sort = ContactsSortings.CreatedAt,
                      order = Order.Desc,
                      groupID,
                      filter,
                  }: FindAllParams): Promise<Contact[]> {
        const orFilter = buildSearchFilter(search);
        const paginationCommands = getPaginateCommands(sort, order, cursorID, limit);

        return await this.prismaService.client.contact.findMany({
            where: {
                byUserID: userID,
                ...orFilter,
                groups: groupID ? {some: {id: groupID}} : undefined,
                // Uncomment this line if tags filtering is implemented
                // tags: filter ? { some: { id: { in: filter.split("*") } } } : undefined,
            },
            // Uncomment this block if including related tags and groups
            // include: {
            //     tags: {
            //         select: {
            //             title: true,
            //             id: true,
            //             color: true,
            //             _count: { select: { contacts: true, groups: true } },
            //         },
            //     },
            //     groups: { select: { title: true, id: true } },
            // },
            ...paginationCommands,
        });
    }

    findAllByTags = async (
        tagIds: string[],
        exclusive?: boolean,
    ): Promise<Contact[]> => {
        const contacts = await this.prismaService.client.contact.findMany({
            where: {
                tags: {
                    [exclusive ? "every" : "some"]: {id: {in: tagIds}},
                },
            },
            include: {tags: true},
        })

        if (!exclusive) {
            return contacts
        }

        //prisma every matches also contacts with no tags
        const filteredContacts = contacts.filter((contact) => {
            const tagIdsSet = new Set(tagIds)
            const contactTagIds = contact.tags.map((tag) => tag.id)
            return (
                tagIdsSet.size ===
                contactTagIds.filter((id) => tagIdsSet.has(id)).length
            )
        })

        return filteredContacts
    }

    findContactsByIds = async (IDs: string[]) => {
        return await this.prismaService.client.contact.findMany({
            where: {id: {in: IDs}},
        })
    }

    getCount = async (userID: string) => {
        return await this.prismaService.client.contact.count({
            where: {byUserID: userID},
        })
    }

    findOne = async (id: string) => {
        return await this.prismaService.client.contact.findUnique({
            where: {id},
            include: {
                tags: true,
                groups: true,
            },
        })
    }

    findOneByFonAndUser = async (fon: string, userID: string) => {
        const internationalFormat = formatFon(fon)

        return await this.prismaService.client.contact.findFirst({
            where: {fon: internationalFormat, byUserID: userID},
        })
    }

    update = async (contactID: string, updateContactDto: UpdateContactDto) => {
        const {fon, tags, groups, ...rest} = updateContactDto;

        // Parse and format the phone number if provided
        const parsed = parsePhoneNumberFromString(
            fon ? (fon.includes("+") ? fon : `+${fon}`) : ""
        );
        const internationalFormat = formatFon(fon ?? "") as string;

        const fonUpdate = fon
            ? {fon: internationalFormat, countryCode: parsed?.country}
            : undefined;

        // Prepare the update data
        const updateData: any = {
            ...rest,
            ...fonUpdate,
            tags: {set: []},
        };

        // Conditionally add groups if provided and is an array
        if (Array.isArray(groups) && groups.length > 0) {
            updateData.groups = {set: groups.map(group => ({id: group.id}))};
        }

        // Perform the update
        const contact = await this.prismaService.client.contact.update({
            where: {id: contactID},
            data: updateData,
            include: {tags: true, groups: true},
        });

        // Update tags if provided
        if (tags?.connect && tags.connect.length > 0) {
            await Promise.all(
                tags.connect.map((tag) => this.addTagToContact(tag.id, contactID))
            );
        }

        return contact;
    }


    upsert = async (
        dto: UpsertContactDto,
        tags: Tag[],
        userID: string,
    ): Promise<Contact> => {
        return await this.prismaService.client.$transaction(async (tx) => {
            const {fon} = dto

            const internationalFormat = formatFon(fon) as string

            const existingUser = await tx.contact.findFirst({
                where: {fon: internationalFormat, byUserID: userID},
            })
            if (existingUser) {
                return await tx.contact.update({
                    where: {id: existingUser.id},
                    data: {
                        ...dto,
                        fon: internationalFormat,
                        tags: {
                            connect: tags.map((tag) => ({id: tag.id})),
                        },
                    },
                })
            }

            return await tx.contact.create({
                data: {
                    ...dto,
                    fon: internationalFormat,
                    byUser: {
                        connect: {
                            id: userID,
                        },
                    },

                    tags: {
                        connect: tags.map((tag) => ({id: tag.id})),
                    },
                },
            })
        })
    }

    addTagToContact = async (tagID: string, contactID: string) => {
        const contact = await this.prismaService.client.contact.update({
            where: {id: contactID},
            data: {
                tags: {connect: {id: tagID}},
            },
            include: {tags: {select: {id: true}}},
        })

        await this.prismaService.client.tag.update({
            where: {id: tagID},
            data: {lastApplied: new Date()},
        })

        const missingGroups = (
            await this.groupsService.findGroupsForTags([tagID])
        ).filter(
            (group) => !group.contacts.some((_contact) => _contact.id === contactID),
        )

        await Promise.all(
            missingGroups.map(async (group) => {
                if (group.isInclusive) {
                    await this.prismaService.client.group.update({
                        where: {id: group.id},
                        data: {contacts: {connect: {id: contactID}}},
                    })
                } else {
                    const otherTags = group.tags.filter(
                        (groupTag) => groupTag.id !== tagID,
                    )

                    const otherTagsPresent = otherTags.every((groupTag) => {
                        if (contact.tags.some((tag) => tag.id === groupTag.id)) {
                            return true
                        }
                        return false
                    })

                    if (otherTagsPresent) {
                        await this.prismaService.client.group.update({
                            where: {id: group.id},
                            data: {contacts: {connect: {id: contactID}}},
                        })
                    }
                }
            }),
        )
    }

    addTagToContacts = async (
        tagID: string,
        contactIDs: string[],
        index: number,
    ): Promise<void> => {
        if (index <= contactIDs.length - 1) {
            await this.addTagToContact(tagID, contactIDs[index])
            return await this.addTagToContacts(tagID, contactIDs, index + 1)
        }
    }

    removeTagFromContact = async (tagID: string, contact: ContactWithTags) => {
        const updatedContact = await this.prismaService.client.contact.update({
            where: {id: contact.id},
            data: {
                tags: {disconnect: {id: tagID}},
            },
            include: {tags: {select: {id: true}}},
        })

        const groups = (await this.groupsService.findGroupsForTags([tagID]))
            .filter((group) =>
                group.contacts.some((_contact) => _contact.id === contact.id),
            )
            .filter((group) => {
                //Filtering out the groups from which the contact should be removed
                //if group has only one tag => remove contact
                if (group.tags.length > 1) {
                    const otherTags = group.tags.filter(
                        (groupTag) => groupTag.id !== tagID,
                    )

                    let removeContact = false

                    if (group.isInclusive) {
                        //incluse groups only need to check if the contact has atleast one of the other tags. if not =>remove
                        removeContact = !otherTags.some((groupTag) =>
                            updatedContact.tags.some((tag) => tag.id === groupTag.id),
                        )
                    } else {
                        removeContact = !otherTags.every((groupTag) =>
                            updatedContact.tags.some((tag) => tag.id === groupTag.id),
                        )
                    }
                    return removeContact
                }
                return true
            })

        await Promise.all(
            groups.map(async (group) => {
                await this.prismaService.client.group.update({
                    where: {id: group.id},
                    data: {contacts: {disconnect: {id: contact.id}}},
                })
            }),
        )
    }

    getKpis = async (userID: string) => {
        const contactsCount = await this.prismaService.client.contact.count({
            where: {byUserID: userID},
        })
        const activeCount = await this.prismaService.client.contact.count({
            where: {
                byUserID: userID,
                active: true,
            },
        })

        return {contactsCount, activeCount}
    }

    remove = async (contactID: string) => {
        await this.prismaService.client.contact.delete({
            where: {id: contactID},
        })
    }

    removeMany = async (contactIDs: string[]) => {
        await this.prismaService.client.contact.deleteMany({
            where: {id: {in: contactIDs}},
        })
    }

    async createOrUpdateContactWithTags(
        service: TagsService,
        upsertContactDto: UpsertContactDto,
        userID: string,
    ): Promise<Contact> {
        const tags = await service.upsertMany(
            upsertContactDto.tags.map((title) => ({ title })),
            userID,
        );
        return this.upsert(upsertContactDto, tags, userID);
    }
}
