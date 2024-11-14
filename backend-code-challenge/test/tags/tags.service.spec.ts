import { Test, TestingModule } from "@nestjs/testing"
import { TagsService } from "../../src/tags/service/tags.service"

describe("Tagsservice", () => {
	let service: TagsService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [TagsService],
		}).compile()

		service = module.get<TagsService>(TagsService)
	})

	it("should be defined", () => {
		expect(service).toBeDefined()
	})
})
