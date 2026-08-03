import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus() {
    return {
      success: true,
      data: {
        service: 'BeatStore Main API',
        status: 'running',
      },
      message: 'Servicio disponible',
      requestId: null,
    };
  }
}
