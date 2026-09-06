import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ImportOrdersModule } from './modules/import-orders/import-orders.module';
import { ExportOrdersModule } from './modules/export-orders/export-orders.module';
import { InventoryHistoriesModule } from './modules/inventory-histories/inventory-histories.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { UsersModule } from './modules/users/users.module';
import { WarehousesModule } from './modules/warehouses/warehouses.module';
import { AgentsModule } from './modules/agents/agents.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { AuthModule } from './modules/auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler/dist';
import { APP_GUARD } from '@nestjs/core';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import KeyvRedis, { Keyv } from '@keyv/redis';
import { KeyvCacheableMemory } from 'cacheable';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env'
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT!),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
      invalidWhereValuesBehavior: {
        null: "ignore",
        undefined: 'ignore',
      }
    }),
    CacheModule.register({
      useFactory: async () => {
        return {
          stores: [
            new Keyv({store: new KeyvCacheableMemory()}),
            new KeyvRedis('redis://localhost:6379'),
          ]
        }
      },
      isGlobal: true,
      ttl: 60 * 1000
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'short',
          ttl: 1000,
          limit: 5,
        },
        {
          name: 'medium',
          ttl: 10000,
          limit: 40
        },
        {
          name: 'long',
          ttl: 60000,
          limit: 200
        }
      ]
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
      }
    }),
    MailerModule.forRoot({
      transport: {
        service: process.env.SMTP_SERVICE,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_APP_PASSWORD
        }
      },
    }),
    ProductsModule,
    OrdersModule,
    ImportOrdersModule,
    InventoryHistoriesModule,
    StatisticsModule,
    UsersModule,
    WarehousesModule,
    AgentsModule,
    SuppliersModule,
    CategoriesModule,
    ExportOrdersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
  ],
})
export class AppModule {}