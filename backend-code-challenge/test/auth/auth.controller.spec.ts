import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../src/auth/controller/auth.controller';
import { AuthService } from '../../src/auth/service/auth.service';
import { UnauthorizedException } from '@nestjs/common';
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
        it('should return access and refresh tokens if credentials are valid', async () => {
            const loginDto: LoginDto = { email: 'test@example.com', password: 'password' };
            const mockUser = { id: 'user-id', email: loginDto.email, role: 'User' };
            const tokens = { access_token: 'access_token', refresh_token: 'refresh_token' };

            jest.spyOn(authService, 'validateUser').mockResolvedValue(mockUser);
            jest.spyOn(authService, 'login').mockResolvedValue(tokens);

            const result = await authController.login(loginDto);

            expect(result).toEqual(tokens);
            expect(authService.validateUser).toHaveBeenCalledWith(loginDto.email, loginDto.password);
            expect(authService.login).toHaveBeenCalledWith(mockUser);
        });

        it('should throw UnauthorizedException if credentials are invalid', async () => {
            const loginDto: LoginDto = { email: 'invalid@example.com', password: 'invalid' };

            jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

            await expect(authController.login(loginDto)).rejects.toThrow(UnauthorizedException);
            expect(authService.validateUser).toHaveBeenCalledWith(loginDto.email, loginDto.password);
            expect(authService.login).not.toHaveBeenCalled();
        });
    });
});
