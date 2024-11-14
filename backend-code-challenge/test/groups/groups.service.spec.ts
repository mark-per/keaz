import { Test, TestingModule } from "@nestjs/testing"
import { GroupsService } from "../../src/groups/service/groups.service"

describe("Groupsservice", () => {
	let service: GroupsService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [GroupsService],
		}).compile()

		service = module.get<GroupsService>(GroupsService)
	})

	it("should be defined", () => {
		expect(service).toBeDefined()
	})
})
