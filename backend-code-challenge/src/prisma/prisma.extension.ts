import { Logger } from "@nestjs/common"
import { PrismaClient } from "@prisma/client"

const _client = new PrismaClient({
	log: ["info", "warn", "error"],
})
const logger = new Logger("PrismaClient")

export const extendedPrismaClient = _client.$extends({
	query: {
		$allModels: {
			$allOperations({ model, operation, args, query }) {
				logger.debug(
					`[PRISMACLIENT]: ${model}, ${operation}, ${JSON.stringify(args)}`,
				)

				return query(args)
			},
		},
	},
	result: {
		user: {
			activated: {
				needs: { activationToken: true },
				compute: (user) => {
					return !(user.activationToken && user.activationToken.length > 0)
				},
			},
		},
	},
})

export type ExtendedPrismaClient = typeof extendedPrismaClient
