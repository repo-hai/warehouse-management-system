import { forwardRef, Module } from '@nestjs/common';
import { WarehousesService } from './warehouses.service';
import { WarehousesController } from './warehouses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Warehouse } from './entities/warehouse.entity';
import { WarehouseEmployee } from './entities/warehouse-employee.entity';
import { WarehouseProductBatch } from './entities/warehouse-product-batch.entity';
import { WarehouseProduct } from './entities/warehouse-product.entity';
import { ImportOrdersModule } from '../import-orders/import-orders.module';
import { ExportOrdersModule } from '../export-orders/export-orders.module';
import { OrdersModule } from '../orders/orders.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Warehouse, WarehouseEmployee, WarehouseProduct, WarehouseProductBatch
    ]),
    forwardRef(() => UsersModule),
    forwardRef(() => OrdersModule),
    forwardRef(() => ImportOrdersModule),
    forwardRef(() => ExportOrdersModule),
  ],
  controllers: [WarehousesController],
  providers: [WarehousesService],
  exports: [TypeOrmModule, WarehousesService]
})
export class WarehousesModule {}
