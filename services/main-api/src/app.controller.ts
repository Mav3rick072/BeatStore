import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Application')
@Controller({
  path: '',
  version: '1',
})
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Comprobar que la API principal está disponible',
  })
  @ApiResponse({
    status: 200,
    description: 'La API está funcionando correctamente.',
    schema: {
      example: {
        success: true,
        data: {
          service: 'BeatStore Main API',
          status: 'running',
        },
        message: 'Servicio disponible',
        requestId: null,
      },
    },
  })
  getStatus() {
    return this.appService.getStatus();
  }
}
