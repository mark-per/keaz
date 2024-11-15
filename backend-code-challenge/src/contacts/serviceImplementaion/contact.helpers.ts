import {Contact, Prisma} from "@prisma/client";
import { ContactsSortings } from "../entities/keaz-contact.entity";
import { escapeRegExp } from "../../common/utils/escapeRegex";
import {Order} from "../../common/pagination/pagination"
import {CreateContactDto} from "../dto/create-contact.dto";

// Function to build search filter
export function buildSearchFilter(search?: string) {
    if (!search) return {};

    const escapedQuery = escapeRegExp(search);
    return {
        OR: [
            { firstName: { contains: escapedQuery, mode: Prisma.QueryMode.insensitive } },
            { lastName: { contains: escapedQuery, mode: Prisma.QueryMode.insensitive } },
            { fon: { contains: escapedQuery, mode: Prisma.QueryMode.insensitive } },
            { email: { contains: escapedQuery, mode: Prisma.QueryMode.insensitive } },
        ],
    };
}

export async function createContactInDatabase(
    contactData: Omit<CreateContactDto, 'fon' | 'tags'>,
    fon: string,
    userID: string,
    country: string
): Promise<Contact> {
    return await this.prismaService.client.contact.create({
        data: {
            ...contactData,
            fon,
            countryCode: country,
            byUser: {
                connect: {id: userID},
            },
        },
        include: {
            tags: true,
            groups: true,
        },
    });
}

export async function addTagsToContact(tags: { id: string }[], contactID: string): Promise<void> {
    await Promise.all(
        tags.map((tag) => this.addTagToContact(tag.id, contactID)),
    );
}
