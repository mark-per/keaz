import { Test, TestingModule } from "@nestjs/testing"
import { Contact } from "@prisma/client"
import { CustomPrismaService } from "nestjs-prisma"
import { ConversationsService } from "src/conversations/conversations.service"
import { ExtendedPrismaClient } from "src/prisma/prisma.extension"
import { UsersService } from "src/users/users.service"
import { ContactsService } from "./contacts.service"

const mockContact = (
	name = "Jane Doe",
	id = "123",
	email = "janedoe@test.com",
	fon = "+49 123 45678",
	countryCode = "de",
	createdAt = new Date(),
): Partial<Contact> => ({
	name,
	id,
	email,
	fon,
	countryCode,
	createdAt,
})

const contactArray = [
	mockContact(),
	mockContact("Jon Doe", "1234", "jondoe@test.com", "+49 123 456789"),
]

describe("Contactsservice", () => {
	let service: ContactsService
	let findManyMock: jest.Mock

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ContactsService,
				{
					provide: CustomPrismaService<ExtendedPrismaClient>,
					useValue: {
						contacts: {
							findMany: findManyMock,
						},
					},
				},
				{
					provide: ConversationsService,
					useValue: {},
				},
				{
					provide: UsersService,
					useValue: {},
				},
			],
		}).compile()

		service = module.get<ContactsService>(ContactsService)
	})

	it("should be defined", () => {
		expect(service).toBeDefined()
	})

	afterEach(() => jest.clearAllMocks())

	it("should return all contacts", async () => {
		findManyMock = jest.fn().mockResolvedValue(contactArray)

		// FIXME:
		// @ts-ignore
		const contacts = await service.findAll("userId")
		expect(contacts).toEqual(contactArray)
	})
})
