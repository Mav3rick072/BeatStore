import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { appConfig } from './config/app/app.config';
import { envValidationSchema } from './config/env/env.validation';

import { AuthModule } from './modules/auth/auth.module';
import { CashRegisterModule } from './modules/cash-register/cash-register.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { ClientsModule } from './modules/clients/clients.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { RentalsModule } from './modules/rentals/rentals.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ReturnsModule } from './modules/returns/returns.module';
import { SalesModule } from './modules/sales/sales.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      load: [appConfig],
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>(
          'app.mongodb.uri',
          'mongodb://mongodb:27017/beatstore',
        ),
      }),
    }),
    InventoryModule,
    UsersModule,
    AuthModule,
    CatalogModule,
    ClientsModule,
    CashRegisterModule,
    SalesModule,
    ReturnsModule,
    RentalsModule,
    LoyaltyModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
