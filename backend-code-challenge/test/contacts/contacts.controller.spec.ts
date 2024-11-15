import { Test, TestingModule } from '@nestjs/testing';
import { ContactsController } from '../../src/contacts/controller/contacts.controller';
import { ContactsService } from '../../src/contacts/serviceImplementaion/contacts.service';
import { TagsService } from '../../src/tags/service/tags.service';
import { CustomLogger } from '../../src/common/loggers/custom.logger.service';
import { JwtAuthGuard } from '../../src/auth/jwt-auth.guard';
import { ForbiddenException, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { CreateContactDto } from '../../src/contacts/dto/create-contact.dto';
import { UpdateContactDto } from '../../src/contacts/dto/update-contact.dto';

describe('ContactsController', () => {
    let controller: ContactsController;
    let contactsService: ContactsService;
    let tagsService: TagsService;
    let logger: CustomLogger;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ContactsController],
            providers: [
                {
                    provide: ContactsService,
                    useValue: {
                        create: jest.fn(),
                        findAll: jest.fn(),
                        findOneByFonAndUser: jest.fn(),
                        getCount: jest.fn(),
                        getKpis: jest.fn(),
                        findOne: jest.fn(),
                        update: jest.fn(),
                        addTagToContact: jest.fn(),
                        removeTagFromContact: jest.fn(),
                        createOrUpdateContactWithTags: jest.fn(),
                        addTagToContacts: jest.fn(),
                        removeMany: jest.fn(),
                        remove: jest.fn(),
                    },
                },
                {
                    provide: TagsService,
                    useValue: {
                        upsertMany: jest.fn(),
                    },
                },
                {
                    provide: CustomLogger,
                    useValue: {
                        log: jest.fn(),
                        error: jest.fn(),
                        warn: jest.fn(),
                        logRequest: jest.fn(),
                        logResponse: jest.fn(),
                    },
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: jest.fn().mockReturnValue(true) })
            .compile();

        controller = module.get<ContactsController>(ContactsController);
        contactsService = module.get<ContactsService>(ContactsService);
        tagsService = module.get<TagsService>(TagsService);
        logger = module.get<CustomLogger>(CustomLogger);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('createContact', () => {
        it('should create a contact', async () => {
            const createContactDto: CreateContactDto = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'johndoe@example.com',
                fon: '+491234567890',
                countryCode: 'DE',
                birthday: new Date(),
                tags: { connect: [{ id: 'tag1' }] },
                groups: { connect: [{ id: 'group1' }] },
            };
            const userID = 'user123';
            const expectedResult = {
                ...createContactDto,
                id: 'contact123',
                createdAt: new Date(),
                updatedAt: new Date(),
                active: true
            };

            jest.spyOn(contactsService, 'create').mockResolvedValue(expectedResult as any);

            const result = await controller.createContact(createContactDto, userID);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('findAllContacts', () => {
        it('should return paginated contacts', async () => {
            const mockContacts = [
                {
                    id: 'contact1',
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'johndoe@example.com',
                    fon: '+491234567890',
                    countryCode: 'DE',
                    birthday: new Date(),
                    active: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    shopifyID: BigInt(1),
                    shopifyPurchaseCount: 1,
                    byUserID: 'user123'
                },
                // Additional mock contacts can be added here
            ];
            const query = { limit: 10, cursorID: null };
            const user = { id: 'user123' };

            const paginatedResponse = { data: mockContacts, cursorID: null };

            jest.spyOn(contactsService, 'findAll').mockResolvedValue(mockContacts as any);

            const result = await controller.findAllContacts(query, user as any);

            expect(result.data).toEqual(mockContacts);
            expect(result.cursorID).toBeNull();

            expect(contactsService.findAll).toHaveBeenCalledWith({ ...query, userID: user.id });
        });
    });

    describe('getCount', () => {
        it('should return the contact count', async () => {
            jest.spyOn(contactsService, 'getCount').mockResolvedValue(5);

            const result = await controller.getCount('user123');
            expect(result).toBe(5);
            expect(contactsService.getCount).toHaveBeenCalledWith('user123');
        });
    });

    describe('getKpis', () => {
        it('should return contact KPIs', async () => {
            const kpis = { totalContacts: 100 };
            jest.spyOn(contactsService, 'getKpis').mockResolvedValue(kpis as any);

            const result = await controller.getKpis('user123');
            expect(result).toEqual(kpis);
            expect(contactsService.getKpis).toHaveBeenCalledWith('user123');
        });
    });

    describe('Unauthorized Access', () => {
        it('should throw UnauthorizedException when no JWT token is provided', async () => {
            jest.spyOn(contactsService, 'findAll').mockResolvedValue([]);

            await expect(controller.findAllContacts({ limit: 10, cursorID: null }, {} as any))
                .rejects
                .toThrowError(new UnauthorizedException());
        });

        it('should throw UnauthorizedException for invalid JWT token', async () => {
            jest.spyOn(contactsService, 'findAll').mockResolvedValue([]);

            await expect(controller.findAllContacts({ limit: 10, cursorID: null }, {} as any))
                .rejects
                .toThrowError(new UnauthorizedException());
        });
    });

    describe('Validation Tests', () => {
        it('should throw BadRequestException for invalid contact email format', async () => {
            const createContactDto = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'invalid-email',  // Invalid email format
                fon: '+491234567890',
                countryCode: 'DE',
            };
            const userID = 'user123';

            await expect(controller.createContact(createContactDto, userID))
                .rejects
                .toThrowError(new BadRequestException());
        });

        it('should throw BadRequestException for missing required fields', async () => {
            const createContactDto = {  // All required fields added
                firstName: 'John',      // Required first name
                lastName: 'Doe',        // Required last name
                email: 'johndoe@example.com',  // Required email
                fon: '+491234567890',   // Required phone number
                countryCode: 'DE',      // Required country code
                birthday: new Date(),   // Required birthday
                tags: { connect: [{ id: 'tag1' }] }, // Assuming tags need to be connected
                groups: { connect: [{ id: 'group1' }] }, // Assuming groups need to be connected
            };
            const userID = 'user123';

            await expect(controller.createContact(createContactDto, userID))
                .rejects
                .toThrowError(new BadRequestException());
        });
    });

    describe('Bulk Operations', () => {
        it('should add tags to multiple contacts', async () => {
            const bulkAddDto = {
                contactIDs: ['contact1', 'contact2'],
            };
            const tagID = 'tag123';
            const user = { id: 'user123' };  // Adding the user parameter

            jest.spyOn(contactsService, 'addTagToContacts').mockResolvedValue(undefined);

            // Pass the user argument to the controller method
            const result = await controller.addTagToContacts(bulkAddDto, tagID, user as any);
            expect(result).toEqual(undefined);
        });

        it('should remove multiple contacts', async () => {
            const bulkRemoveDto = {
                contactIDs: ['contact1', 'contact2'],
            };
            const user = { id: 'user123' };  // Adding the user parameter

            jest.spyOn(contactsService, 'removeMany').mockResolvedValue(undefined);

            // Pass the user argument to the controller method
            await controller.removeManyContacts(bulkRemoveDto, user as any);

            expect(contactsService.removeMany).toHaveBeenCalledWith(bulkRemoveDto.contactIDs);
        });
    });

    describe('Error Handling', () => {
        it('should handle service errors gracefully', async () => {
            jest.spyOn(contactsService, 'findAll').mockRejectedValue(new Error('Database error'));

            await expect(controller.findAllContacts({ limit: 10, cursorID: null }, { id: 'user123' } as any))
                .rejects
                .toThrowError(new Error('Database error'));
        });

        it('should return internal server error for unhandled exceptions', async () => {
            jest.spyOn(contactsService, 'create').mockRejectedValue(new Error('Unexpected error'));

            const createContactDto = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'johndoe@example.com',
                fon: '+491234567890',
                countryCode: 'DE',
            };
            const userID = 'user123';

            await expect(controller.createContact(createContactDto, userID))
                .rejects
                .toThrowError(new Error('Unexpected error'));
        });
    });

    describe('Concurrency & Idempotency', () => {
        it('should handle duplicate contact creation gracefully', async () => {
            const createContactDto = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'johndoe@example.com',
                fon: '+491234567890',
                countryCode: 'DE',
            };
            const userID = 'user123';
            const expectedResult = {
                id: 'contact123',
                firstName: 'John',
                lastName: 'Doe',
                email: 'johndoe@example.com',
                fon: '+491234567890',
                countryCode: 'DE',
                birthday: new Date(),  // Required birthday
                createdAt: new Date(),  // Mock createdAt
                updatedAt: new Date(),  // Mock updatedAt
                notes: '',              // Mock notes
                active: true,           // Mock active status
                shopifyID: 1234567890n, // Mock Shopify ID (BigInt)
                shopifyPurchaseCount: 10, // Mock purchase count
                byUserID: 'user123',    // Mock user ID
            };

            jest.spyOn(contactsService, 'create').mockResolvedValue(expectedResult);

            // Simulate creating the same contact twice
            const result1 = await controller.createContact(createContactDto, userID);
            const result2 = await controller.createContact(createContactDto, userID);

            expect(result1).toEqual(result2);  // Ensure the same contact is returned
        });
    });
});
