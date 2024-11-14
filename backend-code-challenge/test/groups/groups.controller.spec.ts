import { Test, TestingModule } from "@nestjs/testing"
import { GroupsController } from "../../src/groups/controller/groups.controller"
import { GroupsService } from "../../src/groups/service/groups.service"

describe("Groupscontroller", () => {
	let controller: GroupsController

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [GroupsController],
			providers: [GroupsService],
		}).compile()

		controller = module.get<GroupsController>(GroupsController)
	})

	it("should be defined", () => {
		expect(controller).toBeDefined()
	})
})
