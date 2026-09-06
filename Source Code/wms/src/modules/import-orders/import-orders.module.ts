import { forwardRef, Module } from '@nestjs/common';
import { ImportOrdersService } from './import-orders.service';
import { ImportOrdersController } from './import-orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportOrder } from './entities/import-order.entity';
import { SuccessImportEmailConsumer } from './email.consumer';
import { ProductsModule } from '../products/products.module';
import { ImportOrderItem } from './entities/import-order-item.entity';
import { BullModule } from '@nestjs/bullmq';
import { InventoryHistoriesModule } from '../inventory-histories/inventory-histories.module';
import { WarehousesModule } from '../warehouses/warehouses.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([ImportOrder, ImportOrderItem]),
    ProductsModule,
    forwardRef(() => InventoryHistoriesModule),
    forwardRef(() => WarehousesModule),
    BullModule.registerQueue({
      name: 'importSuccessfulEmailQueue'
    })
  ],
  controllers: [ImportOrdersController],
  providers: [ImportOrdersService, SuccessImportEmailConsumer],
  exports: [TypeOrmModule, ImportOrdersService]
})
export class ImportOrdersModule {}
