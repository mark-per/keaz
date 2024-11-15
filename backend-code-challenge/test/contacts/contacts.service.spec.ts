import { Test, TestingModule } from "@nestjs/testing";
import { Contact, Tag } from "@prisma/client";
import { ContactsService } from "../../src/contacts/serviceImplementaion/contacts.service";
import { CustomPrismaService } from "nestjs-prisma";
import { ContactValidationService } from "../../src/contacts/serviceImplementaion/contact.validation.service";
import { GroupsService } from "../../src/groups/service/groups.service";
import { TagsService } from "../../src/tags/service/tags.service";
import { getPaginateCommands, Order } from "../../src/common/pagination/pagination";
import { ContactsSortings, ContactWithTags } from "../../src/contacts/entities/keaz-contact.entity";
import { CreateContactDto } from "../../src/contacts/dto/create-contact.dto";
import { UpdateContactDto } from "../../src/contacts/dto/update-contact.dto";
import * as helpers from "../../src/contacts/serviceImplementaion/contact.helpers"; // Import helpers

const fixedTimestamp = new Date("2024-11-15T11:43:40.919Z");

const mockContact = (id = "123", fon = "+49123456789"): Contact => ({
    id,
    createdAt: fixedTimestamp,
    updatedAt: fixedTimestamp,
    countryCode: "DE",
    email: "test@example.com",
    fon,
    firstName: "John",
    lastName: "Doe",
    birthday: null,
    notes: "Test note",
    active: true,
    byUserID: "userId",
    shopifyID: BigInt(1),
    shopifyPurchaseCount: 0,
});

const contactArray: Contact[] = [mockContact(), mockContact("124")];

const mockPrismaService = {
    client: {
        contact: {
            findMany: jest.fn().mockResolvedValue(contactArray),
            findUnique: jest.fn().mockResolvedValue(mockContact()),
            findFirst: jest.fn().mockResolvedValue(mockContact()),
            count: jest.fn().mockResolvedValue(2),
            create: jest.fn().mockResolvedValue(mockContact()),
            update: jest.fn().mockResolvedValue(mockContact()),
            delete: jest.fn(),
            deleteMany: jest.fn(),
        },
        tag: {
            update: jest.fn(),
        },
        group: {
            update: jest.fn(),
        },
    },
};

const mockValidationService = {
    validatePhoneNumber: jest.fn(),
    checkExistingContact: jest.fn(),
};

const mockGroupsService = {
    findGroupsForTags: jest.fn().mockResolvedValue([
        {
            id: "group1",
            isInclusive: true,
            contacts: [{ id: "123" }, { id: "456" }],
            tags: [{ id: "tag1" }, { id: "tag2" }],
        },
        {
            id: "group2",
            isInclusive: false,
            contacts: [{ id: "789" }],
            tags: [{ id: "tag1" }, { id: "tag3" }],
        },
    ]),
};

const mockTagsService = {
    upsertMany: jest.fn().mockResolvedValue([{ id: "tag1" }]),
};

describe("ContactsService", () => {
    let service: ContactsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ContactsService,
                { provide: "PrismaService", useValue: mockPrismaService },
                { provide: ContactValidationService, useValue: mockValidationService },
                { provide: GroupsService, useValue: mockGroupsService },
                { provide: TagsService, useValue: mockTagsService },
            ],
        }).compile();

        service = module.get<ContactsService>(ContactsService);
    });

    afterEach(() => jest.clearAllMocks());

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("create", () => {
        it("should create a contact", async () => {
            const createContactDto: CreateContactDto = {
                fon: "+49123456789",
                tags: { connect: [{ id: "tag1" }] },
                firstName: "John",
                lastName: "Doe",
            };

            const parsedCountry = "DE";
            const formattedFon = "+49 123456789";

            mockValidationService.validatePhoneNumber.mockResolvedValue(undefined);
            mockValidationService.checkExistingContact.mockResolvedValue(undefined);

            jest.spyOn(helpers, "createContactInDatabase").mockResolvedValue(mockContact());
            jest.spyOn(helpers, "addTagsToContact").mockResolvedValue(undefined);

            const result = await service.create(createContactDto, "userId");

            expect(mockValidationService.validatePhoneNumber).toHaveBeenCalledWith("+49123456789");
            expect(mockValidationService.checkExistingContact).toHaveBeenCalledWith("+49123456789", "userId");

            expect(helpers.createContactInDatabase).toHaveBeenCalledWith(
                { firstName: "John", lastName: "Doe" }, // `rest`
                formattedFon, // `fon`
                "userId", // `userID`
                parsedCountry, // `country`
                mockPrismaService // `prismaService`
            );

            expect(helpers.addTagsToContact).toHaveBeenCalledWith(
                [{ id: "tag1" }],
                "123" // contact.id
            );

            expect(result).toMatchObject(mockContact());
        });

        it("should throw an error if phone number validation fails", async () => {
            const createContactDto: CreateContactDto = {
                fon: "invalid-phone",
                tags: { connect: [{ id: "tag1" }] },
                firstName: "John",
            };
            mockValidationService.validatePhoneNumber.mockImplementation(() => {
                throw new Error("Invalid phone number");
            });

            await expect(service.create(createContactDto, "userId")).rejects.toThrow("Invalid phone number");
            expect(mockValidationService.validatePhoneNumber).toHaveBeenCalledWith("invalid-phone");
        });
    });

    describe("findAll", () => {
        it("should return all contacts for a user", async () => {
            const params = { userID: "userId", sort: ContactsSortings.CreatedAt, order: Order.Desc, limit: 10 };
            const result = await service.findAll(params);
            expect(result).toMatchObject(contactArray);
        });

        it("should handle pagination and filters", async () => {
            const params = {
                userID: "userId",
                groupID: "group1",
                search: "test",
                sort: ContactsSortings.CreatedAt,
                order: Order.Desc,
                cursorID: "cursor1",
                limit: 5,
            };
            const contacts = await service.findAll(params);
            expect(contacts).toMatchObject(contactArray);
        });
    });

    describe("findAllByTags", () => {
        it("should return contacts by tags (inclusive)", async () => {
            const tagIds = ["tag1", "tag2"];
            const result = await service.findAllByTags(tagIds, false);
            expect(result).toMatchObject(contactArray);
        });

        it("should return contacts by tags (exclusive)", async () => {
            const tagIds = ["tag1", "tag2"];
            const contactsWithTags = contactArray.map((contact) => ({
                ...contact,
                tags: tagIds.map((id) => ({ id } as Tag)),
            }));
            mockPrismaService.client.contact.findMany.mockResolvedValue(contactsWithTags);

            const result = await service.findAllByTags(tagIds, true);
            expect(result).toMatchObject(contactsWithTags);
        });

        it("should return an empty array if no contacts match the tags", async () => {
            mockPrismaService.client.contact.findMany.mockResolvedValue([]);
            const result = await service.findAllByTags(["nonexistent-tag"], false);
            expect(result).toEqual([]);
        });
    });

    describe("update", () => {
        it("should update a contact", async () => {
            const updateContactDto: UpdateContactDto = {
                fon: "+49123456789",
                firstName: "Updated Name",
                tags: { connect: [] },
            };
            const result = await service.update("123", updateContactDto);
            expect(result).toMatchObject(mockContact());
        });

        it("should throw an error if the contact to update does not exist", async () => {
            mockPrismaService.client.contact.update.mockRejectedValue(new Error("Contact not found"));

            const updateContactDto: UpdateContactDto = {
                fon: "+49123456789",
                firstName: "Updated Name",
                tags: { connect: [] },
            };

            await expect(service.update("nonexistent-id", updateContactDto)).rejects.toThrow("Contact not found");
        });
    });

    describe("delete", () => {
        it("should delete multiple contacts", async () => {
            await service.removeMany(["123", "124"]);
            expect(mockPrismaService.client.contact.deleteMany).toHaveBeenCalledWith({
                where: { id: { in: ["123", "124"] } },
            });
        });

        it("should delete a single contact", async () => {
            await service.remove("123");
            expect(mockPrismaService.client.contact.delete).toHaveBeenCalledWith({
                where: { id: "123" },
            });
        });
    });

    describe("KPIs", () => {
        it("should get KPI counts", async () => {
            const result = await service.getKpis("userId");
            expect(result).toEqual({ contactsCount: 2, activeCount: 2 });
        });
    });
});