import { forwardRef, Module } from '@nestjs/common';
import { InventoryHistoriesService } from './inventory-histories.service';
import { InventoryHistoriesController } from './inventory-histories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryHistory } from './entities/inventory-history.entity';
import { UsersModule } from '../users/users.module';
import { ExportOrdersModule } from '../export-orders/export-orders.module';
import { WarehousesModule } from '../warehouses/warehouses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InventoryHistory
    ]),
    forwardRef(() => UsersModule),
    forwardRef(() => WarehousesModule), 
    forwardRef(() => ExportOrdersModule)
  ],
  controllers: [InventoryHistoriesController],
  providers: [InventoryHistoriesService],
  exports: [TypeOrmModule, InventoryHistoriesService]
})
export class InventoryHistoriesModule {}
