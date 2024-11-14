import { Logger, Module } from "@nestjs/common"
import { TagsController } from "./controller/tags.controller"
import { TagsService } from "./service/tags.service"

@Module({
	imports: [],
	controllers: [TagsController],
	providers: [TagsService, Logger],
	exports: [TagsService],
})
export class TagsModule {}
