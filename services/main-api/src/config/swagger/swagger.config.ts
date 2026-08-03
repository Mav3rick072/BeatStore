import { DocumentBuilder } from '@nestjs/swagger';

export const createSwaggerConfig = () =>
  new DocumentBuilder()
    .setTitle('BeatStore Main API')
    .setDescription(
      'API pública principal del sistema POS BeatStore. React debe consumir únicamente esta API.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT obtenido durante el inicio de sesión.',
      },
      'access-token',
    )
    .build();
