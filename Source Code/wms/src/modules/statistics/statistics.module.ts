import { Module } from '@nestjs/common';
import { statisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { AgentsModule } from '../agents/agents.module';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { ImportOrdersModule } from '../import-orders/import-orders.module';
import { ExportOrdersModule } from '../export-orders/export-orders.module';
import { InventoryHistoriesModule } from '../inventory-histories/inventory-histories.module';
import { WarehousesModule } from '../warehouses/warehouses.module';

@Module({
  imports: [
    AgentsModule,
    SuppliersModule,
    ImportOrdersModule,
    ExportOrdersModule,
    WarehousesModule,
    InventoryHistoriesModule
  ],
  controllers: [StatisticsController],
  providers: [statisticsService],
})
export class StatisticsModule {}
