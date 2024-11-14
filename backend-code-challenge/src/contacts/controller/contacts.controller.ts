import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";
import { $Enums, User as UserModel } from "@prisma/client";
import {
    ContactBulkDto,
    UpsertContactDto,
} from "../dto/keaz-create-contact.dto";
import { Contact } from "../entities/contact.entity";
import {
    ContactKpis,
    ContactWithTags,
    ContactWithTagsAndGroups,
    ContactsSortings,
} from "../entities/keaz-contact.entity";
import { ApiOkResponsePaginated } from "../../decorators/paginate.decorator";
import { TagsService } from "../../tags/service/tags.service";
import { GetPaginateQuery, Paginate } from "../../common/pagination/pagination";
import { User } from "../../decorators/user.decorator";
import { ContactsService } from "../service/contacts.service";
import { CreateContactDto } from "../dto/create-contact.dto";
import { UpdateContactDto } from "../dto/update-contact.dto";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { CustomLogger } from "../../common/loggers/custom.logger.service";
import {
    logRequest,
    logResponse,
    handlePaginatedResponse,
    findContactsOrThrow,
    findContactOrThrow,
    validateContactAccess
} from "./contacts.controller.helper";

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags("contacts")
@Controller("contacts")
export class ContactsController {
    constructor(
        private readonly contactsService: ContactsService,
        private readonly tagsService: TagsService,
        private readonly logger: CustomLogger,
    ) {}

    @ApiOperation({ summary: "Create a new contact" })
    @Post()
    async createContact(
        @Body() createContactDto: CreateContactDto,
        @User("id") userID: string,
    ): Promise<Contact> {
        logRequest(this.logger, 'POST', '/contacts', createContactDto);

        const result = await this.contactsService.create(createContactDto, userID);

        logResponse(this.logger, 201, 'Created contact', result);
        return result;
    }

    @ApiOperation({ summary: "Retrieve all contacts" })
    @ApiOkResponsePaginated(ContactWithTagsAndGroups, ContactsSortings)
    @Get()
    async findAllContacts(
        @Query() query: GetPaginateQuery<ContactsSortings>,
        @User() user: UserModel,
    ): Promise<Paginate<ContactWithTagsAndGroups>> {
        logRequest(this.logger, 'GET', '/contacts', query);

        const contacts = await findContactsOrThrow(this.contactsService, { ...query, userID: user.id });
        logResponse(this.logger, 200, 'Contacts fetched successfully', contacts.length);

        return handlePaginatedResponse(contacts, query.limit);
    }

    @ApiOperation({ summary: "Retrieve contacts by group ID" })
    @ApiOkResponsePaginated(ContactWithTagsAndGroups, ContactsSortings)
    @Get("groups/:groupID")
    async findAllContactsForGroup(
        @Query() query: GetPaginateQuery<ContactsSortings>,
        @User("id") userID: string,
        @Param("groupID") groupID: string,
    ): Promise<Paginate<ContactWithTagsAndGroups>> {
        logRequest(this.logger, 'GET', `/contacts/groups/${groupID}`, query);

        const contacts = await findContactsOrThrow(this.contactsService, { ...query, userID, groupID });
        logResponse(this.logger, 200, 'Fetched contacts for group', contacts.length);

        return handlePaginatedResponse(contacts, query.limit);
    }

    @ApiOperation({ summary: "Get contact count for a user" })
    @Get("/count")
    async getCount(@User("id") userID: string): Promise<number> {
        logRequest(this.logger, 'GET', '/contacts/count', { userID });

        const count = await this.contactsService.getCount(userID);

        logResponse(this.logger, 200, 'Retrieved contact count', count);
        return count;
    }

    @ApiOperation({ summary: "Retrieve contact KPIs for a user" })
    @Get("/kpi")
    async getKpis(@User("id") userID: string): Promise<ContactKpis> {
        logRequest(this.logger, 'GET', '/contacts/kpi', { userID });

        const kpis = await this.contactsService.getKpis(userID);

        logResponse(this.logger, 200, 'Retrieved contact KPIs', kpis);
        return kpis;
    }

    @ApiOperation({ summary: "Retrieve a specific contact by ID" })
    @Get(":id")
    async findOneContact(
        @Param("id") id: string,
        @User() user: UserModel,
    ): Promise<ContactWithTags> {
        logRequest(this.logger, 'GET', `/contacts/${id}`, { userID: user.id });

        const contact = await validateContactAccess(this.contactsService, id, user);

        logResponse(this.logger, 200, 'Fetched contact', contact);
        return contact;
    }

    @ApiOperation({ summary: "Upsert (create or update) a contact" })
    @SkipThrottle()
    @Post("upsert")
    async createOrUpdateContact(
        @Body() upsertContactDto: UpsertContactDto,
        @User("id") userID: string,
    ): Promise<Contact> {
        logRequest(this.logger, 'POST', '/contacts/upsert', upsertContactDto);

        const result = await this.contactsService.createOrUpdateContactWithTags(this.tagsService, upsertContactDto, userID);

        logResponse(this.logger, 200, 'Upserted contact', result);
        return result;
    }

    @ApiOperation({ summary: "Update a specific contact" })
    @Patch(":id")
    async updateContact(
        @Param("id") id: string,
        @Body() updateContactDto: UpdateContactDto,
        @User() user: UserModel,
    ): Promise<ContactWithTags> {
        logRequest(this.logger, 'PATCH', `/contacts/${id}`, updateContactDto);

        const contact = await findContactOrThrow(this.contactsService, id, user);
        const updatedContact = await this.contactsService.update(contact.id, updateContactDto);

        logResponse(this.logger, 200, 'Updated contact', updatedContact);
        return updatedContact;
    }

    @ApiOperation({ summary: "Add a tag to multiple contacts" })
    @Patch("tag/:tagID")
    async addTagToContacts(
        @Body() dto: ContactBulkDto,
        @Param("tagID") tagID: string,
    ) {
        logRequest(this.logger, 'PATCH', `/contacts/tag/${tagID}`, dto);

        const result = await this.contactsService.addTagToContacts(tagID, dto.contactIDs, 0);

        logResponse(this.logger, 200, 'Added tag to contacts', result);
        return result;
    }

    @ApiOperation({ summary: "Add a tag to a specific contact" })
    @Patch(":id/tag/:tagID")
    async addTagToContact(
        @Param("id") id: string,
        @Param("tagID") tagID: string,
        @User() user: UserModel,
    ) {
        logRequest(this.logger, 'PATCH', `/contacts/${id}/tag/${tagID}`, {});

        const contact = await findContactOrThrow(this.contactsService, id, user);
        const result = await this.contactsService.addTagToContact(tagID, contact.id);

        logResponse(this.logger, 200, 'Added tag to contact', result);
        return result;
    }

    @ApiOperation({ summary: "Remove a tag from a specific contact" })
    @Delete(":id/tag/:tagID")
    async removeTagFromContact(
        @Param("id") id: string,
        @Param("tagID") tagID: string,
        @User() user: UserModel,
    ) {
        logRequest(this.logger, 'DELETE', `/contacts/${id}/tag/${tagID}`, {});

        const contact = await findContactOrThrow(this.contactsService, id, user);
        const result = await this.contactsService.removeTagFromContact(tagID, contact);

        logResponse(this.logger, 200, 'Removed tag from contact', result);
        return result;
    }

    @ApiOperation({ summary: "Remove multiple contacts" })
    @Delete("many")
    async removeManyContacts(@Body() dto: ContactBulkDto): Promise<void> {
        logRequest(this.logger, 'DELETE', '/contacts/many', dto);

        await this.contactsService.removeMany(dto.contactIDs);

        logResponse(this.logger, 200, 'Removed multiple contacts');
    }

    @ApiOperation({ summary: "Remove a specific contact" })
    @Delete(":id")
    async removeContact(
        @Param("id") id: string,
        @User() user: UserModel,
    ): Promise<void> {
        logRequest(this.logger, 'DELETE', `/contacts/${id}`, {});

        const contact = await findContactOrThrow(this.contactsService, id, user);
        await this.contactsService.remove(contact.id);

        logResponse(this.logger, 200, 'Removed contact');
    }
}