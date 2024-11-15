import { NotFoundException, ForbiddenException, MethodNotAllowedException, UnauthorizedException } from "@nestjs/common";
import { ContactsService } from "../../src/contacts/serviceImplementaion/contacts.service";
import {
    handlePaginatedResponse,
    findContactsOrThrow,
    findContactOrThrow,
} from "../../src/contacts/controller/contacts.controller.helper";
import { $Enums } from "@prisma/client";

describe("Contacts Controller Helper", () => {
    let mockContactsService: ContactsService;

    const mockUser = {
        id: "user1",
        createdAt: new Date(),
        updatedAt: new Date(),
        email: "user@example.com",
        firstName: "John",
        lastName: "Doe",
        code: "U123",
        companyName: "Example Corp",
        companyAvatarUrl: "http://example.com/avatar.png",
        fon: "123456789",
        archived: null,
        role: $Enums.UserRole.User,
        hash: "hashedpassword",
        adminID: "admin1",
        resetToken: null,
        activationToken: null,
    };

    const mockContactWithTagsAndGroups = {
        id: "contact1",
        tags: [],
        groups: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        countryCode: "US",
        email: "contact@example.com",
        fon: "987654321",
        firstName: "ContactFirst",
        lastName: "ContactLast",
        birthday: new Date("1990-01-01"),
        notes: "Test notes",
        active: true,
        shopifyID: BigInt(1),
        shopifyPurchaseCount: 5,
        byUserID: "user1",
        byUser: mockUser,
    };

    beforeEach(() => {
        mockContactsService = {
            findAll: jest.fn(),
            findOne: jest.fn(),
        } as unknown as ContactsService;
    });

    describe("Contacts Controller Helper", () => {
        let mockContactsService: ContactsService;

        const mockUser = {
            id: "user1",
            createdAt: new Date(),
            updatedAt: new Date(),
            email: "user@example.com",
            firstName: "John",
            lastName: "Doe",
            code: "U123",
            companyName: "Example Corp",
            companyAvatarUrl: "http://example.com/avatar.png",
            fon: "123456789",
            archived: null,
            role: $Enums.UserRole.User,
            hash: "hashedpassword",
            adminID: "admin1",
            resetToken: null,
            activationToken: null,
        };

        const mockContactWithTagsAndGroups = {
            id: "contact1",
            tags: [],
            groups: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            countryCode: "US",
            email: "contact@example.com",
            fon: "987654321",
            firstName: "ContactFirst",
            lastName: "ContactLast",
            birthday: new Date("1990-01-01"),
            notes: "Test notes",
            active: true,
            shopifyID: BigInt(1),
            shopifyPurchaseCount: 5,
            byUserID: "user1",
            byUser: mockUser,
        };

        beforeEach(() => {
            mockContactsService = {
                findAll: jest.fn(),
                findOne: jest.fn(),
            } as unknown as ContactsService;
        });

        describe("handlePaginatedResponse", () => {
            it("should return a paginated response with cursorID when limit is reached", () => {
                const contacts = [mockContactWithTagsAndGroups, mockContactWithTagsAndGroups];
                const response = handlePaginatedResponse(contacts, 2);
                expect(response).toEqual({
                    data: contacts,
                    cursorID: "contact1",
                });
            });

            it("should return null cursorID when limit is not reached", () => {
                const contacts = [mockContactWithTagsAndGroups];
                const response = handlePaginatedResponse(contacts, 2);
                expect(response).toEqual({
                    data: contacts,
                    cursorID: null,
                });
            });

            it("should handle empty contacts array", () => {
                const contacts = [];
                const response = handlePaginatedResponse(contacts, 2);
                expect(response).toEqual({
                    data: [],
                    cursorID: null,
                });
            });

            it("should handle an array with null contacts gracefully", () => {
                const contacts = [null, mockContactWithTagsAndGroups];
                const response = handlePaginatedResponse(contacts as any, 2);
                expect(response).toEqual({
                    data: [null, mockContactWithTagsAndGroups],
                    cursorID: "contact1",
                });
            });

        });

        describe("findContactsOrThrow", () => {
            it("should return contacts if found", async () => {
                jest.spyOn(mockContactsService, "findAll").mockResolvedValue([mockContactWithTagsAndGroups]);
                const result = await findContactsOrThrow(mockContactsService, { userID: "user1" });
                expect(result).toEqual([mockContactWithTagsAndGroups]);
            });

            it("should throw NotFoundException if no contacts are found", async () => {
                jest.spyOn(mockContactsService, "findAll").mockResolvedValue([]);
                await expect(findContactsOrThrow(mockContactsService, { userID: "user1" })).rejects.toThrow(NotFoundException);
            });

            it("should handle invalid params gracefully", async () => {
                jest.spyOn(mockContactsService, "findAll").mockResolvedValue([]);
                await expect(findContactsOrThrow(mockContactsService, {} as any)).rejects.toThrow(NotFoundException);
            });

            it("should handle service errors gracefully", async () => {
                jest.spyOn(mockContactsService, "findAll").mockRejectedValue(new Error("Service error"));
                await expect(findContactsOrThrow(mockContactsService, { userID: "user1" })).rejects.toThrow(Error);
            });

            it("should throw NotFoundException if params are missing required fields", async () => {
                await expect(findContactsOrThrow(mockContactsService, { groupID: "group1" } as any)).rejects.toThrow(NotFoundException);
            });

        });

        describe("findContactOrThrow", () => {
            it("should return a contact if found and access is allowed", async () => {
                jest.spyOn(mockContactsService, "findOne").mockResolvedValue(mockContactWithTagsAndGroups);
                const result = await findContactOrThrow(mockContactsService, "contact1", mockUser);
                expect(result).toEqual(mockContactWithTagsAndGroups);
            });

            it("should throw NotFoundException if contact is not found", async () => {
                jest.spyOn(mockContactsService, "findOne").mockResolvedValue(null);
                await expect(findContactOrThrow(mockContactsService, "contact1", mockUser)).rejects.toThrow(NotFoundException);
            });

            it("should throw ForbiddenException if user access is denied", async () => {
                const contact = { ...mockContactWithTagsAndGroups, byUser: { ...mockUser, id: "user2" } };
                jest.spyOn(mockContactsService, "findOne").mockResolvedValue(contact);
                await expect(findContactOrThrow(mockContactsService, "contact1", mockUser)).rejects.toThrow(ForbiddenException);
            });

            it("should throw NotFoundException for empty contactId", async () => {
                jest.spyOn(mockContactsService, "findOne").mockResolvedValue(null);
                await expect(findContactOrThrow(mockContactsService, "", mockUser)).rejects.toThrow(NotFoundException);
            });

            it("should throw NotFoundException for invalid contactId format", async () => {
                jest.spyOn(mockContactsService, "findOne").mockResolvedValue(null);
                await expect(findContactOrThrow(mockContactsService, "@invalidId!", mockUser)).rejects.toThrow(NotFoundException);
            });

        });

    });

});
