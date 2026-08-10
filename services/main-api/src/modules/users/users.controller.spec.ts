import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const usersService = {
    findAll: jest.fn<() => Promise<unknown[]>>(),
    findOne: jest.fn<() => Promise<unknown>>(),
    create: jest.fn<() => Promise<unknown>>(),
    update: jest.fn<() => Promise<unknown>>(),
    setStatus: jest.fn<() => Promise<unknown>>(),
    remove: jest.fn<() => Promise<unknown>>(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate findAll to the service', async () => {
    usersService.findAll.mockResolvedValue([]);
    await controller.findAll();
    expect(usersService.findAll).toHaveBeenCalledTimes(1);
  });
});
