import { Test, TestingModule } from '@nestjs/testing';
import { statisticsService } from './statistics.service';
import { AgentsModule } from '../agents/agents.module';
import { ExportOrdersModule } from '../export-orders/export-orders.module';
import { ImportOrdersModule } from '../import-orders/import-orders.module';
import { InventoryHistoriesModule } from '../inventory-histories/inventory-histories.module';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { WarehousesModule } from '../warehouses/warehouses.module';
import { ROOT_SETTING, TIMEOUT } from '../../utilities/constants/constants';

describe('statisticsService', () => {
  let service: statisticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ...ROOT_SETTING,
        AgentsModule,
        SuppliersModule,
        ImportOrdersModule,
        ExportOrdersModule,
        WarehousesModule,
        InventoryHistoriesModule,
      ],
      providers: [statisticsService],
    }).compile();

    service = module.get<statisticsService>(statisticsService);
  }, TIMEOUT.TEST_TIMEOUT);

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
