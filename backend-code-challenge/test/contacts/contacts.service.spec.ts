import { Test, TestingModule } from "@nestjs/testing";
import { Contact } from "@prisma/client";
import { CustomPrismaService } from "nestjs-prisma";
import { UsersService } from "../../src/users/service/users.service";
import { ContactsService } from "../../src/contacts/service/contacts.service";

// Helper to create mock contact objects
const mockContact = (
	firstName = "Jane",
	lastName = "Doe",
	id = "123",
	email = "janedoe@test.com",
	fon = "+49 123 45678",
	countryCode = "de",
	createdAt = new Date(),
): Partial<Contact> => ({
	firstName,
	lastName,
	id,
	email,
	fon,
	countryCode,
	createdAt,
	birthday: new Date(),
	notes: "",
	active: true,
	shopifyID: BigInt(1),
	shopifyPurchaseCount: 1,
	byUserID: "user123",
	updatedAt: new Date(),
});

const contactArray = [
	mockContact(),
	mockContact("Jon", "Doe", "1234", "jondoe@test.com", "+49 123 456789"),
];

describe("ContactsService", () => {
	let service: ContactsService;
	let findManyMock: jest.Mock;

	beforeEach(async () => {
		// Initialize mock before the service is created
		findManyMock = jest.fn();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ContactsService,
				{
					provide: CustomPrismaService,
					useValue: {
						contacts: {
							findMany: findManyMock,
						},
					},
				},
				{
					provide: UsersService,
					useValue: {},
				},
			],
		}).compile();

		service = module.get<ContactsService>(ContactsService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	afterEach(() => jest.clearAllMocks());

	it("should return all contacts", async () => {
		// Mock the response for findMany method
		findManyMock.mockResolvedValue(contactArray);

		// Pass the correct FindAllParams type
		const findAllParams = { userID: "user123", limit: 10, cursorID: null };

		// Call the findAll method from ContactsService
		const contacts = await service.findAll(findAllParams);

		// Ensure the result matches the mock
		expect(contacts).toEqual(contactArray);
		expect(findManyMock).toHaveBeenCalledWith({
			where: { byUserID: "user123" }, // Assuming the find method uses a userID filter
		});
	});
});
