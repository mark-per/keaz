import { Test, TestingModule } from '@nestjs/testing';
import { ContactsService } from '../../src/contacts/serviceImplementaion/contacts.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { PrismaModule } from '../../src/prisma/prisma.module';

describe('ContactsService', () => {
    let contactsService: ContactsService;
    let prismaService: PrismaService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [PrismaModule],
            providers: [ContactsService],
        }).compile();

        contactsService = module.get<ContactsService>(ContactsService);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    beforeEach(() => {
        jest.spyOn(prismaService.contact, 'create').mockClear();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(contactsService).toBeDefined();
        expect(prismaService).toBeDefined();
    });

    it('should create a new contact', async () => {
        const newContactData = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            fon: '1234567890',
        };
        const userID = 'user-id';

        const mockContact = {
            id: 'contact-id',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            fon: '1234567890',
            createdAt: new Date(),
            updatedAt: new Date(),
            countryCode: 'US',
            birthday: new Date(),
            notes: '',
            active: true,
            shopifyID: BigInt(1),
            shopifyPurchaseCount: 0,
            byUserID: userID,
        };

        jest.spyOn(prismaService.contact, 'create').mockResolvedValue(mockContact);

        const result = await contactsService.create(newContactData, userID);

        expect(result).toEqual({
            ...mockContact,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
            birthday: expect.any(Date),
        });

        expect(prismaService.contact.create).toHaveBeenCalledWith({
            data: { ...newContactData, byUserID: userID },
        });
    });
});
