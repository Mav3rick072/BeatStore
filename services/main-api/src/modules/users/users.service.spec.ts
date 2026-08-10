import { ConflictException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { UserRole } from './enums/user-role.enum';
import { User } from './schemas/user.schema';
import { UsersService } from './services/users.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserModel: any = jest.fn().mockImplementation((doc: any) => ({
    ...doc,
    _id: 'generated-id',
    save: jest.fn<() => Promise<boolean>>().mockResolvedValue(true),
  }));

  beforeEach(async () => {
    mockUserModel.findOne = jest.fn();
    mockUserModel.find = jest.fn();
    mockUserModel.findById = jest.fn();
    mockUserModel.create = jest.fn();
    mockUserModel.sort = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user when the email is not taken', async () => {
    mockUserModel.findOne.mockResolvedValue(null);
    mockUserModel.create.mockResolvedValue({
      _id: '66b0326f152918695023bc11',
      firstName: 'Carlos',
      lastName: 'Pérez',
      email: 'carlos@beatstore.com',
      role: UserRole.ADMIN,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.create({
      firstName: 'Carlos',
      lastName: 'Pérez',
      email: 'carlos@beatstore.com',
      password: 'BeatStore123',
      role: UserRole.ADMIN,
    });

    expect(result.email).toBe('carlos@beatstore.com');
    expect(mockUserModel.create).toHaveBeenCalledTimes(1);
  });

  it('should throw ConflictException when the email is already registered', async () => {
    mockUserModel.findOne.mockResolvedValue({ email: 'carlos@beatstore.com' });

    await expect(
      service.create({
        firstName: 'Carlos',
        lastName: 'Pérez',
        email: 'carlos@beatstore.com',
        password: 'BeatStore123',
        role: UserRole.ADMIN,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should throw NotFoundException when the user does not exist', async () => {
    mockUserModel.findById.mockResolvedValue(null);

    await expect(service.findOne('missing-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
