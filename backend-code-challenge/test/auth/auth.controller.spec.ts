import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../src/auth/controller/auth.controller';
import { AuthService } from '../../src/auth/service/auth.service';
import { JwtAuthGuard } from '../../src/auth/jwt-auth.guard';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { LoginDto } from '../../src/auth/dto/login.dto';

describe('AuthController', () => {
    let authController: AuthController;
    let authService: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: {
                        validateUser: jest.fn(),
                        login: jest.fn(),
                    },
                },
            ],
        }).compile();

        authController = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(authController).toBeDefined();
    });

    describe('login', () => {
        it('should return access_token if credentials are valid', async () => {
            const loginDto: LoginDto = { email: 'test@example.com', password: 'password' };
            const token = { access_token: 'test_token' };

            jest.spyOn(authService, 'validateUser').mockResolvedValue({ id: 'user-id', email: loginDto.email });
            jest.spyOn(authService, 'login').mockResolvedValue(token);

            const result = await authController.login(loginDto);
            expect(result).toEqual(token);
            expect(authService.validateUser).toHaveBeenCalledWith(loginDto.email, loginDto.password);
            expect(authService.login).toHaveBeenCalledWith({ id: 'user-id', email: loginDto.email });
        });

        it('should throw UnauthorizedException if credentials are invalid', async () => {
            const loginDto: LoginDto = { email: 'invalid@example.com', password: 'invalid' };

            jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

            await expect(authController.login(loginDto)).rejects.toThrow(UnauthorizedException);
            expect(authService.validateUser).toHaveBeenCalledWith(loginDto.email, loginDto.password);
        });
    });

    describe('getProfile', () => {
        it('should return the user profile', async () => {
            const mockUser = { id: 'user-id', email: 'test@example.com' };
            const result = authController.getProfile(mockUser);
            expect(result).toEqual(mockUser.id);
        });

        it('should throw UnauthorizedException if user is missing', () => {
            const mockUser = null;
            try {
                authController.getProfile(mockUser);
            } catch (error) {
                expect(error).toBeInstanceOf(UnauthorizedException);
                expect(error.message).toBe('User not found. Authentication required');
            }
        });
    });

    describe('Guards and Decorators', () => {
        it('should apply JwtAuthGuard to the getProfile route', () => {
            const guards = Reflect.getMetadata('__guards__', authController.getProfile);
            const guardInstances = guards ? guards.map((guard: any) => guard.name) : [];
            expect(guardInstances).toContain(JwtAuthGuard.name);
        });
    });
});
