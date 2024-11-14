import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from '../../src/auth/jwt.strategy';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
    let jwtStrategy: JwtStrategy;

    beforeEach(async () => {
        process.env.JWT_SECRET = 'yourSecretKey'; // Set the JWT secret directly

        const module: TestingModule = await Test.createTestingModule({
            providers: [JwtStrategy],
        }).compile();

        jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    });

    it('should be defined', () => {
        expect(jwtStrategy).toBeDefined();
    });

    describe('validate', () => {
        it('should return the user payload if validated successfully', async () => {
            const payload = { id: 'user-id', email: 'test@example.com', role: 'user' };
            const result = await jwtStrategy.validate(payload);

            expect(result).toEqual(payload);
        });

        it('should throw UnauthorizedException if the payload is invalid', async () => {
            const invalidPayload = null;

            await expect(jwtStrategy.validate(invalidPayload)).rejects.toThrow(UnauthorizedException);
        });

    });
});
