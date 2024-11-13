import { Test, TestingModule } from "@nestjs/testing"
import { ContactsService } from "../contacts/contacts.service"
import { ContactsController } from "./contacts.controller"

describe("Contactscontroller", () => {
	let controller: ContactsController

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [ContactsController],
			providers: [
				{
					provide: ContactsService,
					useValue: {
						findAll: jest
							.fn()
							.mockImplementation(async (_userId, _query) => []),
					},
				},
			],
		}).compile()

		controller = module.get<ContactsController>(ContactsController)
	})

	it("should be defined", () => {
		expect(controller).toBeDefined()
	})

	describe("findAllContacts", () => {
		it("should return an array of contacts", async () => {
			// await expect(controller.findAllContacts({}, "userId")).resolves.toEqual(
			// 	[],
			// )
		})
	})
})
