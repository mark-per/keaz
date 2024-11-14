import { Test, TestingModule } from "@nestjs/testing"
import { TagsController } from "../../src/tags/controller/tags.controller"
import { TagsService } from "../../src/tags/service/tags.service"

describe("Tagscontroller", () => {
	let controller: TagsController

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [TagsController],
			providers: [TagsService],
		}).compile()

		controller = module.get<TagsController>(TagsController)
	})

	it("should be defined", () => {
		expect(controller).toBeDefined()
	})
})
