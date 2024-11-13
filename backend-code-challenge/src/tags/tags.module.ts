import { Logger, Module } from "@nestjs/common"
import { TagsController } from "./tags.controller"
import { TagsService } from "./tags.service"

@Module({
	imports: [],
	controllers: [TagsController],
	providers: [TagsService, Logger],
	exports: [TagsService],
})
export class TagsModule {}
