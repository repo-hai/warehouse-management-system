import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { WarehousesModule } from '../warehouses/warehouses.module';
import { ImportOrdersModule } from '../import-orders/import-orders.module';
import { ExportOrdersModule } from '../export-orders/export-orders.module';
import { InventoryHistoriesModule } from '../inventory-histories/inventory-histories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User
    ]),
    forwardRef(() => WarehousesModule),
    forwardRef(() => ImportOrdersModule),
    forwardRef(() => InventoryHistoriesModule),
    forwardRef(() => ExportOrdersModule)
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [TypeOrmModule, UsersService]
})
export class UsersModule {}
