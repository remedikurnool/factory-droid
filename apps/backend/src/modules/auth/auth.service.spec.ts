import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../../database/prisma.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user data when credentials are valid', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        role: 'CUSTOMER',
        phone: '1234567890',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
      });
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    });

    it('should return null when user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@example.com', 'password123');

      expect(result).toBeNull();
    });

    it('should return null when password is incorrect', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        role: 'CUSTOMER',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token when login is successful', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'CUSTOMER',
      };

      mockJwtService.sign.mockReturnValue('mock.jwt.token');

      const result = await service.login(mockUser);

      expect(result).toEqual({
        access_token: 'mock.jwt.token',
        user: mockUser,
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
        role: mockUser.role,
      });
    });
  });

  describe('register', () => {
    it('should create a new user and return access token', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        phone: '1234567890',
        role: 'CUSTOMER' as const,
      };

      const mockCreatedUser = {
        id: '2',
        ...registerDto,
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockPrismaService.user.create.mockResolvedValue(mockCreatedUser);
      mockJwtService.sign.mockReturnValue('mock.jwt.token');

      const result = await service.register(registerDto);

      expect(result).toEqual({
        access_token: 'mock.jwt.token',
        user: {
          id: mockCreatedUser.id,
          email: mockCreatedUser.email,
          name: mockCreatedUser.name,
          role: mockCreatedUser.role,
        },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          ...registerDto,
          password: 'hashedPassword',
        },
      });
    });
  });
});
