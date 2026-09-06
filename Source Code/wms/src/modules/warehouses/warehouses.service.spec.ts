import { Test, TestingModule } from '@nestjs/testing';
import { WarehousesService } from './warehouses.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ROOT_SETTING, TIMEOUT } from '../../utilities/constants/constants';
import { BadRequestException, ConflictException, forwardRef, HttpException, NotFoundException } from '@nestjs/common';
import { ExportOrdersModule } from '../export-orders/export-orders.module';
import { ImportOrdersModule } from '../import-orders/import-orders.module';
import { InventoryHistoriesModule } from '../inventory-histories/inventory-histories.module';
import { OrdersModule } from '../orders/orders.module';
import { UsersModule } from '../users/users.module';
import { WarehouseEmployee } from './entities/warehouse-employee.entity';
import { WarehouseProductBatch } from './entities/warehouse-product-batch.entity';
import { WarehouseProduct } from './entities/warehouse-product.entity';
import { Warehouse } from './entities/warehouse.entity';
import { UpdateWarehouseProductBatchDto } from './dto/update-warehouse-product-batch.dto';
import assert from 'assert';

describe('WarehousesService', () => {
  let warehousesService: WarehousesService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ...ROOT_SETTING,
        TypeOrmModule.forFeature([Warehouse, WarehouseEmployee, WarehouseProduct, WarehouseProductBatch]),
        InventoryHistoriesModule,
        forwardRef(() => UsersModule),
        forwardRef(() => OrdersModule),
        forwardRef(() => ImportOrdersModule),
        forwardRef(() => ExportOrdersModule),
      ],
      providers: [WarehousesService],
    }).compile();

    warehousesService = module.get<WarehousesService>(WarehousesService);
  }, TIMEOUT.TEST_TIMEOUT);

  it('should be defined', () => {
    expect(warehousesService).toBeDefined();
  });

  describe('updateWarehouseProductBatch ', () => {
    it('Test_case_ID: WarehousesService_1 -> Should return update result', async () => {
      const warehouseProductBatchId = '4';
      const managerId = '1';

      const updateWarehouseProductBatchDto = new UpdateWarehouseProductBatchDto();
      updateWarehouseProductBatchDto.stock = 100;

      const updateResult = await warehousesService.updateWarehouseProductBatch(warehouseProductBatchId, managerId, updateWarehouseProductBatchDto)
    
      expect(updateResult).toBeInstanceOf(WarehouseProductBatch);
    });

    it('Test_case_ID: WarehousesService_2 -> Should return exception 409 - Conflict', async () => {
      try{
        const warehouseProductBatchId = '4';
        const managerId = '10';

        const updateWarehouseProductBatchDto = new UpdateWarehouseProductBatchDto();
        updateWarehouseProductBatchDto.stock = 100;

        await warehousesService.updateWarehouseProductBatch(warehouseProductBatchId, managerId, updateWarehouseProductBatchDto)
    
        assert.fail();
      } catch(error){
        if(error instanceof HttpException){
          if(error instanceof NotFoundException == false && error instanceof ConflictException == false){
            assert.fail();
          }
        } else {
          assert.fail();
        }
      }
    });

    it('Test_case_ID: WarehousesService_4 -> Should return exception 400 - Bad request', async () => {
      try{
        const warehouseProductBatchId = '4';
        const managerId = '10';

        const updateWarehouseProductBatchDto = new UpdateWarehouseProductBatchDto();
        updateWarehouseProductBatchDto.stock = -1;

        await warehousesService.updateWarehouseProductBatch(warehouseProductBatchId, managerId, updateWarehouseProductBatchDto)
    
        assert.fail();
      } catch(error){
        if(error instanceof HttpException){
          expect(error).toBeInstanceOf(BadRequestException);
        } else {
          assert.fail();
        }
      }
    });

    it('Test_case_ID: WarehousesService_5 -> Should return exception 400 - Bad request', async () => {
      try{
        const warehouseProductBatchId = '4';
        const managerId = '1';

        const updateWarehouseProductBatchDto = new UpdateWarehouseProductBatchDto();
        updateWarehouseProductBatchDto.stock = 0;

        await warehousesService.updateWarehouseProductBatch(warehouseProductBatchId, managerId, updateWarehouseProductBatchDto)
    
        assert.fail();
      } catch(error){
        console.log(error);

        if(error instanceof HttpException){
          expect(error).toBeInstanceOf(ConflictException);
        } else {
          assert.fail();
        }
      }
    });

    it('Test_case_ID: WarehousesService_6 -> Should return exception 409 - Conflict', async () => {
      try{
        const warehouseProductBatchId = '1000000';
        const managerId = '10';

        const updateWarehouseProductBatchDto = new UpdateWarehouseProductBatchDto();
        updateWarehouseProductBatchDto.stock = 200;

        await warehousesService.updateWarehouseProductBatch(warehouseProductBatchId, managerId, updateWarehouseProductBatchDto)
    
        assert.fail();
      } catch(error){
        // console.log(error);
        if(error instanceof HttpException){
          if(error instanceof NotFoundException == false && error instanceof ConflictException == false){
            assert.fail();
          }
        } else {
          assert.fail();
        }
      }
    });
  });
});
