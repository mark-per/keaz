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
import {ApiBearerAuth, ApiOperation, ApiTags} from "@nestjs/swagger";
import {SkipThrottle} from "@nestjs/throttler";
import {$Enums, User as UserModel} from "@prisma/client";
import {
    ContactBulkDto,
    UpsertContactDto,
} from "../dto/keaz-create-contact.dto";
import {Contact} from "../entities/contact.entity";
import {
    ContactKpis,
    ContactWithTags,
    ContactWithTagsAndGroups,
    ContactsSortings,
} from "../entities/keaz-contact.entity";
import {ApiOkResponsePaginated} from "../../decorators/paginate.decorator";
import {TagsService} from "../../tags/service/tags.service";
import {GetPaginateQuery, Paginate} from "../../common/pagination/pagination";
import {User} from "../../decorators/user.decorator";
import {ContactsService} from "../serviceImplementaion/contacts.service";
import {CreateContactDto} from "../dto/create-contact.dto";
import {UpdateContactDto} from "../dto/update-contact.dto";
import {JwtAuthGuard} from "../../auth/jwt-auth.guard";
import {
    findContactOrThrow,
    findContactsOrThrow,
    handlePaginatedResponse,
    validateContactAccess,
} from "./contacts.controller.helper";

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags("contacts")
@Controller("contacts")
export class ContactsController {
    constructor(
        private readonly contactsService: ContactsService,
        private readonly tagsService: TagsService
    ) {
    }

    @ApiOperation({summary: "Create a new contact"})
    @Post()
    async createContact(
        @Body() createContactDto: CreateContactDto,
        @User("id") userID: string
    ): Promise<Contact> {
        return this.contactsService.create(createContactDto, userID);
    }

    @ApiOperation({summary: "Retrieve all contacts"})
    @ApiOkResponsePaginated(ContactWithTagsAndGroups, ContactsSortings)
    @Get()
    async findAllContacts(
        @Query() query: GetPaginateQuery<ContactsSortings>,
        @User() user: UserModel
    ): Promise<Paginate<ContactWithTagsAndGroups>> {
        const contacts = await findContactsOrThrow(this.contactsService, {
            ...query,
            userID: user.id,
        });
        return handlePaginatedResponse(contacts, query.limit);
    }

    @ApiOperation({summary: "Retrieve contacts by group ID"})
    @ApiOkResponsePaginated(ContactWithTagsAndGroups, ContactsSortings)
    @Get("groups/:groupID")
    async findAllContactsForGroup(
        @Query() query: GetPaginateQuery<ContactsSortings>,
        @User("id") userID: string,
        @Param("groupID") groupID: string
    ): Promise<Paginate<ContactWithTagsAndGroups>> {
        const contacts = await findContactsOrThrow(this.contactsService, {
            ...query,
            userID,
            groupID,
        });
        return handlePaginatedResponse(contacts, query.limit);
    }

    @ApiOperation({summary: "Get contact count for a user"})
    @Get("/count")
    async getCount(@User("id") userID: string): Promise<number> {
        return this.contactsService.getCount(userID);
    }

    @ApiOperation({summary: "Retrieve contact KPIs for a user"})
    @Get("/kpi")
    async getKpis(@User("id") userID: string): Promise<ContactKpis> {
        return this.contactsService.getKpis(userID);
    }

    @ApiOperation({summary: "Retrieve a specific contact by ID"})
    @Get(":id")
    async findOneContact(
        @Param("id") id: string,
        @User() user: UserModel
    ): Promise<ContactWithTags> {
        return validateContactAccess(this.contactsService, id, user);
    }

    @ApiOperation({summary: "Upsert (create or update) a contact"})
    @SkipThrottle()
    @Post("upsert")
    async createOrUpdateContact(
        @Body() upsertContactDto: UpsertContactDto,
        @User("id") userID: string
    ): Promise<Contact> {
        return this.contactsService.createOrUpdateContactWithTags(
            this.tagsService,
            upsertContactDto,
            userID
        );
    }

    @ApiOperation({summary: "Update a specific contact"})
    @Patch(":id")
    async updateContact(
        @Param("id") id: string,
        @Body() updateContactDto: UpdateContactDto,
        @User() user
    ): Promise<ContactWithTags> {
        const contact = await findContactOrThrow(this.contactsService, id, user);
        return this.contactsService.update(contact.id, updateContactDto);
    }

    @ApiOperation({summary: "Add a tag to multiple contacts"})
    @Patch("tag/:tagID")
    async addTagToContacts(
        @Body() dto: ContactBulkDto,
        @Param("tagID") tagID: string,
        @User() user
    ) {
        return this.contactsService.addTagToContacts(
            tagID,
            dto.contactIDs,
            0
        );
    }

    @ApiOperation({summary: "Add a tag to a specific contact"})
    @Patch(":id/tag/:tagID")
    async addTagToContact(
        @Param("id") id: string,
        @Param("tagID") tagID: string,
        @User() user
    ) {
        const contact = await findContactOrThrow(this.contactsService, id, user);
        return this.contactsService.addTagToContact(tagID, contact.id);
    }

    @ApiOperation({summary: "Remove a tag from a specific contact"})
    @Delete(":id/tag/:tagID")
    async removeTagFromContact(
        @Param("id") id: string,
        @Param("tagID") tagID: string,
        @User() user
    ) {
        const contact = await findContactOrThrow(this.contactsService, id, user);
        return this.contactsService.removeTagFromContact(tagID, contact);
    }

    @ApiOperation({summary: "Remove multiple contacts"})
    @Delete("many")
    async removeManyContacts(
        @Body() dto: ContactBulkDto,
        @User() user
    ): Promise<void> {
        await this.contactsService.removeMany(dto.contactIDs);
    }

    @ApiOperation({summary: "Remove a specific contact"})
    @Delete(":id")
    async removeContact(
        @Param("id") id: string,
        @User() user
    ): Promise<void> {
        const contact = await findContactOrThrow(this.contactsService, id, user);
        await this.contactsService.remove(contact.id);
    }
}
