import {Inject, Injectable, forwardRef} from "@nestjs/common";
import {Contact, Prisma, Tag} from "@prisma/client";
import {parsePhoneNumberFromString} from "libphonenumber-js";
import {CustomPrismaService} from "nestjs-prisma";
import {UpsertContactDto} from "src/contacts/dto/keaz-create-contact.dto";
import {ContactsSortings, ContactWithTags} from "../entities/keaz-contact.entity";
import {GroupsService} from "../../groups/service/groups.service";
import {ExtendedPrismaClient} from "../../prisma/prisma.extension";
import {formatFon} from "../../common/utils/formatPhonenumber";
import {CreateContactDto} from "../dto/create-contact.dto";
import {UpdateContactDto} from "../dto/update-contact.dto";
import {ContactValidationService} from "./contact.validation.service";
import {buildSearchFilter, addTagsToContact, createContactInDatabase} from "./contact.helpers";
import {TagsService} from "../../tags/service/tags.service";
import {getPaginateCommands, Order} from "../../common/pagination/pagination";

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
        @Inject(forwardRef(() => ContactValidationService))
        readonly contactValidationService: ContactValidationService,
    ) {
    }

    async create(dto: CreateContactDto, userID: string): Promise<Contact> {
        const {fon, tags, ...rest} = dto;

        await this.contactValidationService.validatePhoneNumber(fon);
        await this.contactValidationService.checkExistingContact(fon, userID);

        const parsed = parsePhoneNumberFromString(fon.includes("+") ? fon : `+${fon}`);
        const internationalFormat = formatFon(fon) as string;
        const contact = await createContactInDatabase(rest, internationalFormat, userID, parsed?.country || '');

        if (tags?.connect?.length) {
            await addTagsToContact(tags.connect, contact.id);
        }

        return contact;
    }

    async findAll(params: FindAllParams): Promise<Contact[]> {
        const orFilter = buildSearchFilter(params.search);
        const paginationCommands = getPaginateCommands(params.sort, params.order, params.cursorID, params.limit);

        return await this.prismaService.client.contact.findMany({
            where: {
                byUserID: params.userID,
                ...orFilter,
                groups: params.groupID ? {some: {id: params.groupID}} : undefined,
            },
            ...paginationCommands,
        });
    }

    async findAllByTags(tagIds: string[], exclusive?: boolean): Promise<Contact[]> {
        const contacts = await this.prismaService.client.contact.findMany({
            where: {
                tags: {
                    [exclusive ? "every" : "some"]: {id: {in: tagIds}},
                },
            },
            include: {tags: true},
        });

        if (!exclusive) {
            return contacts;
        }

        return contacts.filter((contact) => {
            const tagIdsSet = new Set(tagIds);
            const contactTagIds = contact.tags.map((tag) => tag.id);
            return tagIdsSet.size === contactTagIds.filter((id) => tagIdsSet.has(id)).length;
        });
    }

    async getCount(userID: string): Promise<number> {
        return await this.prismaService.client.contact.count({where: {byUserID: userID}});
    }

    async findOne(id: string): Promise<ContactWithTags> {
        return await this.prismaService.client.contact.findUnique({
            where: {id},
            include: {tags: true, groups: true,byUser: true,},
        });
    }

    async findOneByFonAndUser(fon: string, userID: string): Promise<Contact | null> {
        const internationalFormat = formatFon(fon);
        return await this.prismaService.client.contact.findFirst({
            where: {fon: internationalFormat, byUserID: userID},
        });
    }

    async getKpis(userID: string): Promise<{ contactsCount: number; activeCount: number }> {
        const contactsCount = await this.prismaService.client.contact.count({where: {byUserID: userID}});
        const activeCount = await this.prismaService.client.contact.count({
            where: {byUserID: userID, active: true},
        });
        return {contactsCount, activeCount};
    }

    async createOrUpdateContactWithTags(service: TagsService, upsertContactDto: UpsertContactDto, userID: string): Promise<Contact> {
        const tags = await service.upsertMany(
            upsertContactDto.tags.map((title) => ({title})),
            userID,
        );
        return this.upsert(upsertContactDto, tags, userID);
    }

    async update(contactID: string, updateContactDto: UpdateContactDto): Promise<ContactWithTags> {
        const {fon, tags, groups, ...rest} = updateContactDto;

        const parsed = parsePhoneNumberFromString(fon ? (fon.includes("+") ? fon : `+${fon}`) : "");
        const internationalFormat = formatFon(fon ?? "") as string;

        const fonUpdate = fon ? {fon: internationalFormat, countryCode: parsed?.country} : undefined;

        const updateData: any = {
            ...rest,
            ...fonUpdate,
            tags: {set: []},  // Ensures tags are part of the update
        };

        if (Array.isArray(groups) && groups.length > 0) {
            updateData.groups = {set: groups.map(group => ({id: group.id}))};
        }

        const updatedContact = await this.prismaService.client.contact.update({
            where: {id: contactID},
            data: updateData,
            include: {tags: true, groups: true}, // Include tags in the result
        });

        if (tags?.connect && tags.connect.length > 0) {
            await Promise.all(tags.connect.map((tag) => this.addTagToContact(tag.id, contactID)));
        }

        return updatedContact as ContactWithTags;
    }


    async upsert(dto: UpsertContactDto, tags: Tag[], userID: string): Promise<Contact> {
        return await this.prismaService.client.$transaction(async (tx) => {
            const internationalFormat = formatFon(dto.fon) as string;

            const existingUser = await tx.contact.findFirst({
                where: {fon: internationalFormat, byUserID: userID},
            });
            if (existingUser) {
                return await tx.contact.update({
                    where: {id: existingUser.id},
                    data: {...dto, fon: internationalFormat, tags: {connect: tags.map((tag) => ({id: tag.id}))}},
                });
            }

            return await tx.contact.create({
                data: {
                    ...dto,
                    fon: internationalFormat,
                    byUser: {connect: {id: userID}},
                    tags: {connect: tags.map((tag) => ({id: tag.id}))},
                },
            });
        });
    }

    async addTagToContact(tagID: string, contactID: string): Promise<void> {
        const contact = await this.prismaService.client.contact.update({
            where: {id: contactID},
            data: {tags: {connect: {id: tagID}}},
            include: {tags: {select: {id: true}}},
        });

        await this.prismaService.client.tag.update({
            where: {id: tagID},
            data: {lastApplied: new Date()},
        });

        const missingGroups = (await this.groupsService.findGroupsForTags([tagID])).filter(
            (group) => !group.contacts.some((_contact) => _contact.id === contactID)
        );

        await Promise.all(
            missingGroups.map(async (group) => {
                if (group.isInclusive) {
                    await this.prismaService.client.group.update({
                        where: {id: group.id},
                        data: {contacts: {connect: {id: contactID}}},
                    });
                } else {
                    const otherTags = group.tags.filter((groupTag) => groupTag.id !== tagID);
                    const otherTagsPresent = otherTags.every((groupTag) =>
                        contact.tags.some((tag) => tag.id === groupTag.id)
                    );

                    if (otherTagsPresent) {
                        await this.prismaService.client.group.update({
                            where: {id: group.id},
                            data: {contacts: {connect: {id: contactID}}},
                        });
                    }
                }
            })
        );
    }

    async addTagToContacts(tagID: string, contactIDs: string[], index: number): Promise<void> {
        if (index <= contactIDs.length - 1) {
            await this.addTagToContact(tagID, contactIDs[index]);
            return await this.addTagToContacts(tagID, contactIDs, index + 1);
        }
    }

    async removeTagFromContact(tagID: string, contact: ContactWithTags): Promise<void> {
        const updatedContact = await this.prismaService.client.contact.update({
            where: {id: contact.id},
            data: {tags: {disconnect: {id: tagID}}},
            include: {tags: {select: {id: true}}},
        });

        const groups = (await this.groupsService.findGroupsForTags([tagID]))
            .filter(group => group.contacts.some(_contact => _contact.id === contact.id))
            .filter(group => {
                if (group.tags.length > 1) {
                    const otherTags = group.tags.filter(groupTag => groupTag.id !== tagID);
                    let removeContact = group.isInclusive
                        ? !otherTags.some(groupTag => updatedContact.tags.some(tag => tag.id === groupTag.id))
                        : !otherTags.every(groupTag => updatedContact.tags.some(tag => tag.id === groupTag.id));
                    return removeContact;
                }
                return true;
            });

        await Promise.all(groups.map(async group => {
            await this.prismaService.client.group.update({
                where: {id: group.id},
                data: {contacts: {disconnect: {id: contact.id}}},
            });
        }));
    }

    async removeMany(contactIDs: string[]): Promise<void> {
        await this.prismaService.client.contact.deleteMany({where: {id: {in: contactIDs}}});
    }

    async remove(contactID: string): Promise<void> {
        await this.prismaService.client.contact.delete({where: {id: contactID}});
    }
}