import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from '../../src/auth/jwt.strategy';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
    let jwtStrategy: JwtStrategy;

    beforeEach(async () => {
        process.env.JWT_SECRET = 'yourSecretKey'; // Set the JWT secret for testing

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

            expect(result).toEqual({
                id: 'user-id',
                email: 'test@example.com',
                role: 'user',
            });
        });

        it('should throw UnauthorizedException if payload is null', async () => {
            const invalidPayload = null;

            await expect(jwtStrategy.validate(invalidPayload)).rejects.toThrow(UnauthorizedException);
            await expect(jwtStrategy.validate(invalidPayload)).rejects.toThrow('Invalid token payload');
        });

        it('should throw UnauthorizedException if payload is missing required fields', async () => {
            const incompletePayload = { id: 'user-id' }; // Missing 'email'

            await expect(jwtStrategy.validate(incompletePayload)).rejects.toThrow(UnauthorizedException);
            await expect(jwtStrategy.validate(incompletePayload)).rejects.toThrow('Invalid token payload');
        });

        it('should handle missing role gracefully and still return the payload', async () => {
            const payloadWithoutRole = { id: 'user-id', email: 'test@example.com' };

            const result = await jwtStrategy.validate(payloadWithoutRole);

            expect(result).toEqual({
                id: 'user-id',
                email: 'test@example.com',
                role: undefined, // Role can be optional
            });
        });
    });
});
