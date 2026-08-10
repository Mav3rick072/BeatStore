import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getStatus', () => {
    it('should return the current service status', () => {
      expect(appController.getStatus()).toEqual({
        success: true,
        data: {
          service: 'BeatStore Main API',
          status: 'running',
        },
        message: 'Servicio disponible',
        requestId: null,
      });
    });
  });
});
