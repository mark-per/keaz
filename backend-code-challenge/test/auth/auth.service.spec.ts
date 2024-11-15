import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/auth/service/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../src/users/service/users.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
    let authService: AuthService;
    let usersService: UsersService;
    let jwtService: JwtService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: {
                        findByEmail: jest.fn(),
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn().mockReturnValue('test_token'),
                    },
                },
            ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
        usersService = module.get<UsersService>(UsersService);
        jwtService = module.get<JwtService>(JwtService);
    });

    describe('validateUser', () => {
        it('should return user data without hash if credentials are valid', async () => {
            const user = {
                id: 'user-id',
                email: 'test@example.com',
                hash: 'hashedPassword',
                role: 'user',
                firstName: 'Test',
                lastName: 'User',
            };
            jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
            jest.spyOn(usersService, 'findByEmail').mockResolvedValue(user as any);

            const result = await authService.validateUser('test@example.com', 'password');

            expect(result).toEqual({
                id: 'user-id',
                email: 'test@example.com',
                role: 'user',
                firstName: 'Test',
                lastName: 'User',
            });
            expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
            expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
        });

        it('should throw UnauthorizedException if user is not found', async () => {
            jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

            await expect(authService.validateUser('invalid@example.com', 'password'))
                .rejects.toThrow(UnauthorizedException);
            expect(usersService.findByEmail).toHaveBeenCalledWith('invalid@example.com');
        });

        it('should throw UnauthorizedException if password is incorrect', async () => {
            const user = {
                id: 'user-id',
                email: 'test@example.com',
                hash: 'hashedPassword',
                role: 'user',
            };
            jest.spyOn(usersService, 'findByEmail').mockResolvedValue(user as any);
            jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

            await expect(authService.validateUser('test@example.com', 'wrongPassword'))
                .rejects.toThrow(UnauthorizedException);
            expect(bcrypt.compare).toHaveBeenCalledWith('wrongPassword', 'hashedPassword');
        });
    });

    describe('login', () => {
        it('should return both access_token and refresh_token for a valid user', async () => {
            const user = { id: 'user-id', email: 'test@example.com', role: 'user' };

            const result = await authService.login(user);

            expect(result).toEqual({
                access_token: 'test_token',
                refresh_token: 'test_token',
            });
            expect(jwtService.sign).toHaveBeenCalledWith(
                { email: user.email, id: user.id, role: user.role },
                { expiresIn: '1h' }
            );
            expect(jwtService.sign).toHaveBeenCalledWith(
                { email: user.email, id: user.id, role: user.role },
                { expiresIn: '12h' }
            );
        });
    });
});
