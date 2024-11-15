// contacts.controller.helper.ts

import {CustomLogger} from "../../common/loggers/custom.logger.service";
import {Paginate} from "../../common/pagination/pagination";
import {ContactWithTags, ContactWithTagsAndGroups} from "../entities/keaz-contact.entity";
import {ContactsService, FindAllParams} from "../service/contacts.service";
import {ForbiddenException, MethodNotAllowedException, NotFoundException, UnauthorizedException} from "@nestjs/common";
import {$Enums} from "@prisma/client";
import {User as UserModel} from "@prisma/client"

export function logRequest(logger: CustomLogger, method: string, url: string, data: any) {
    logger.logRequest({method, url, data});
}

export function logResponse(
    logger: CustomLogger,
    statusCode: number,
    statusMessage: string,
    data?: any
) {
    logger.logResponse({
        message: statusMessage, statusCode, data: data !== undefined ? data : null,
    });
}

export function handlePaginatedResponse(
    contacts: ContactWithTagsAndGroups[],
    limit: number
): Paginate<ContactWithTagsAndGroups> {
    return {
        data: contacts,
        cursorID: contacts.length === limit ? contacts[contacts.length - 1].id : null,
    };
}

export async function findContactsOrThrow(service: any, params: FindAllParams): Promise<ContactWithTagsAndGroups[]> {
    const contacts = await service.findAll(params);
    if (!contacts || contacts.length === 0) {
        throw new NotFoundException("Contacts not found");
    }
    return contacts;
}

export async function findContactOrThrow(contactsService: ContactsService, contactId: string, user) {
    const contact = await contactsService.findOne(contactId);

    if (!contact) {
        throw new NotFoundException(`Contact with ID ${contactId} not found`);
    }

    if (user.role === $Enums.UserRole.User && contact.byUser.id !== user.id) {
        throw new ForbiddenException('Access denied');
    }

    return contact;
}

export async function validateContactAccess(
    service: ContactsService,
    contactID: string,
    user: UserModel,
): Promise<ContactWithTags> {
    const contact = await service.findOne(contactID);

    if (!contact) {
        throw new NotFoundException("Contact not found");
    }

    if (user.role === $Enums.UserRole.User && contact.byUser.id !== user.id) {
        throw new MethodNotAllowedException("Not allowed to access this contact");
    }

    return contact;
}

export function validateUser(user: any): void {
    if (!user || typeof user !== "object" || !user.id || typeof user.id !== "string") {
        throw new UnauthorizedException("Invalid or missing user information");
    }
}
