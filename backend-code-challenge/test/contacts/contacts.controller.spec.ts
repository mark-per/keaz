import {Test, TestingModule} from "@nestjs/testing"
import {ContactsService} from "../../src/contacts/contacts.service"
import {ContactsController} from "../../src/contacts/contacts.controller"

describe('ContactsController', () => {
    let controller: ContactsController;
    let contactsService: ContactsService;
    let tagsService: TagsService;

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
                    },
                },
                {
                    provide: TagsService,
                    useValue: {
                        upsertMany: jest.fn(),
                    },
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({canActivate: jest.fn().mockReturnValue(true)})
            .compile();

        controller = module.get<ContactsController>(ContactsController);
        contactsService = module.get<ContactsService>(ContactsService);
        tagsService = module.get<TagsService>(TagsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('createContact', () => {
        it('should create a contact', async () => {
            const createContactDto: CreateContactDto = {
                countryCode: 'DE',
                email: 'johndoe@example.com',
                fon: '+491234567890',
                firstName: 'John',
                lastName: 'Doe',
                birthday: new Date(),
                tags: {connect: [{id: 'tag1'}]},
                groups: {connect: [{id: 'group1'}]},
            };
            const userID = 'user123';
            const expectedResult = {...createContactDto, id: 'contact123'};

            jest.spyOn(contactsService, 'create').mockResolvedValue(expectedResult as any);

            const result = await controller.createContact(createContactDto, userID);
            expect(result).toEqual(expectedResult);
        });

        it('should throw ForbiddenException if contact already exists', async () => {
            const createContactDto: CreateContactDto = {
                countryCode: 'DE',
                email: 'johndoe@example.com',
                fon: '+491234567890',
                firstName: 'John',
                lastName: 'Doe',
                birthday: new Date(),
                tags: {connect: [{id: 'tag1'}]},
                groups: {connect: [{id: 'group1'}]},
            };
            const userID = 'user123';

            jest.spyOn(contactsService, 'findOneByFonAndUser').mockResolvedValue(true);

            await expect(controller.createContact(createContactDto, userID)).rejects.toThrow(
                ForbiddenException,
            );
        });

        it('should throw ForbiddenException for invalid phone number format', async () => {
            const createContactDto: CreateContactDto = {
                countryCode: 'DE',
                email: 'johndoe@example.com',
                fon: 'invalid-phone',
                firstName: 'John',
                lastName: 'Doe',
                birthday: new Date(),
                tags: {connect: [{id: 'tag1'}]},
                groups: {connect: [{id: 'group1'}]},
            };
            const userID = 'user123';

            await expect(controller.createContact(createContactDto, userID)).rejects.toThrow(
                ForbiddenException,
            );
        });
    });

    describe('findAllContacts', () => {
        it('should return an array of contacts', async () => {
            const mockContacts = [{id: 'contact123', firstName: 'John'}];
            jest.spyOn(contactsService, 'findAll').mockResolvedValue(mockContacts as any);

            const query = {limit: 10, offset: 0};
            const user = {id: 'user123'};

            const result = await controller.findAllContacts(query, user as any);
            expect(result.data).toEqual(mockContacts);
        });
    });

    describe('getCount', () => {
        it('should return the count of contacts', async () => {
            jest.spyOn(contactsService, 'getCount').mockResolvedValue(5);
            const userID = 'user123';

            const result = await controller.getCount(userID);
            expect(result).toBe(5);
        });
    });

    describe('getKpis', () => {
        it('should return KPIs of contacts', async () => {
            const mockKpis = {totalContacts: 10};
            jest.spyOn(contactsService, 'getKpis').mockResolvedValue(mockKpis as any);

            const userID = 'user123';
            const result = await controller.getKpis(userID);
            expect(result).toEqual(mockKpis);
        });
    });

    describe('findOneContact', () => {
        it('should return a contact by id', async () => {
            const mockContact = {id: 'contact123', firstName: 'John'};
            jest.spyOn(contactsService, 'findOne').mockResolvedValue(mockContact as any);

            const user = {id: 'user123', role: 'User'};
            const result = await controller.findOneContact('contact123', user as any);
            expect(result).toEqual(mockContact);
        });

        it('should throw NotFoundException if contact not found', async () => {
            jest.spyOn(contactsService, 'findOne').mockResolvedValue(null);

            const user = {id: 'user123', role: 'User'};
            await expect(controller.findOneContact('contact123', user as any)).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('updateContact', () => {
        it('should update a contact', async () => {
            const updateContactDto: UpdateContactDto = {firstName: 'Jane'};
            const mockContact = {id: 'contact123', firstName: 'Jane'};
            jest.spyOn(contactsService, 'findOne').mockResolvedValue(mockContact as any);
            jest.spyOn(contactsService, 'update').mockResolvedValue(mockContact as any);

            const user = {id: 'user123', role: 'User'};
            const result = await controller.updateContact('contact123', updateContactDto, user as any);
            expect(result).toEqual(mockContact);
        });
    });

    describe('addTagToContact', () => {
        it('should add a tag to a contact', async () => {
            const mockContact = {id: 'contact123', firstName: 'John'};
            jest.spyOn(contactsService, 'findOne').mockResolvedValue(mockContact as any);
            jest.spyOn(contactsService, 'addTagToContact').mockResolvedValue(mockContact as any);

            const user = {id: 'user123', role: 'User'};
            const result = await controller.addTagToContact('contact123', 'tag123', user as any);
            expect(result).toEqual(mockContact);
        });
    });

    describe('removeTagFromContact', () => {
        it('should remove a tag from a contact', async () => {
            const mockContact = {id: 'contact123', firstName: 'John'};
            jest.spyOn(contactsService, 'findOne').mockResolvedValue(mockContact as any);
            jest.spyOn(contactsService, 'removeTagFromContact').mockResolvedValue(mockContact as any);

            const user = {id: 'user123', role: 'User'};
            const result = await controller.removeTagFromContact('tag123', 'contact123', user as any);
            expect(result).toEqual(mockContact);
        });
    });
});
