import { forwardRef, Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderProduct } from './entities/order-product.entity';
import { ProductsModule } from '../products/products.module';
import { AgentsModule } from '../agents/agents.module';
import { WarehousesModule } from '../warehouses/warehouses.module';
import { ExportOrdersModule } from '../export-orders/export-orders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order, OrderProduct
    ]),
    ProductsModule,
    forwardRef(() => ExportOrdersModule),
    forwardRef(() => AgentsModule),
    forwardRef(() => WarehousesModule)
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [TypeOrmModule, OrdersService]
})
export class OrdersModule {}
