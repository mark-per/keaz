import { Type, applyDecorators } from "@nestjs/common"
import {
	ApiExtraModels,
	ApiOkResponse,
	ApiQuery,
	getSchemaPath,
} from "@nestjs/swagger"
import { SwaggerEnumType } from "@nestjs/swagger/dist/types/swagger-enum.type"
import { Paginate } from "../common/pagination/pagination"

export const ApiOkResponsePaginated = <
	DataDto extends Type<unknown>,
	SortingEnum extends SwaggerEnumType,
>(
	dataDto: DataDto,
	sortingEnum: SortingEnum,
) =>
	applyDecorators(
		ApiQuery({
			name: "sort",
			required: false,
			type: "string",
			enum: sortingEnum,
		}),
		ApiExtraModels(Paginate, dataDto),
		ApiOkResponse({
			type: dataDto,
			isArray: true,
			description: "paginate",
			schema: {
				allOf: [
					{ $ref: getSchemaPath(Paginate) },
					{
						properties: {
							data: {
								type: "array",
								items: { $ref: getSchemaPath(dataDto) },
							},
						},
					},
				],
			},
		}),
	)
