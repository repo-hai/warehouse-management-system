import { forwardRef, Module } from '@nestjs/common';
import { ExportOrdersService } from './export-orders.service';
import { ExportOrdersController } from './export-orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportOrder } from './entities/export-order.entity';
import { UsersModule } from '../users/users.module';
import { WarehousesModule } from '../warehouses/warehouses.module';
import { InventoryHistoriesModule } from '../inventory-histories/inventory-histories.module';
import { ProductsModule } from '../products/products.module';
import { ExportOrderItem } from './entities/export-order-item.entity';
import { OrdersModule } from '../orders/orders.module';
import { AgentsModule } from '../agents/agents.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExportOrder, ExportOrderItem
    ]),
    ProductsModule,
    forwardRef(() => AgentsModule),
    forwardRef(() => OrdersModule),
    forwardRef(() => UsersModule),
    forwardRef(() => WarehousesModule),
    forwardRef(() => InventoryHistoriesModule),
  ],
  controllers: [ExportOrdersController],
  providers: [ExportOrdersService],
  exports: [TypeOrmModule, ExportOrdersService]
})
export class ExportOrdersModule {}
