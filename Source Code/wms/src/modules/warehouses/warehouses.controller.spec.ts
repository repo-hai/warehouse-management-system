import { Test, TestingModule } from '@nestjs/testing';
import { WarehousesController } from './warehouses.controller';
import { WarehousesService } from './warehouses.service';
import { BadRequestException, ConflictException, forwardRef, HttpException, NotFoundException } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportOrdersModule } from '../export-orders/export-orders.module';
import { ImportOrdersModule } from '../import-orders/import-orders.module';
import { InventoryHistoriesModule } from '../inventory-histories/inventory-histories.module';
import { OrdersModule } from '../orders/orders.module';
import { UsersModule } from '../users/users.module';
import { WarehouseEmployee } from './entities/warehouse-employee.entity';
import { WarehouseProductBatch } from './entities/warehouse-product-batch.entity';
import { WarehouseProduct } from './entities/warehouse-product.entity';
import { Warehouse } from './entities/warehouse.entity';
import { ROOT_SETTING, TIMEOUT } from '../../utilities/constants/constants';
import { UpdateWarehouseProductBatchDto } from './dto/update-warehouse-product-batch.dto';
import assert from 'assert';

describe('WarehousesController', () => {
  let warehousesController: WarehousesController;

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
      controllers: [WarehousesController],
      providers: [WarehousesService],
    }).compile();

    warehousesController = module.get<WarehousesController>(WarehousesController);
  }, TIMEOUT.TEST_TIMEOUT);

  it('should be defined', () => {
    expect(warehousesController).toBeDefined();
  });

  describe('updateWarehouseProductBatch - PATCH /warehouses/productBatchs/:id', () => {
    it('Test_case_ID: WarehousesController_3 -> Should return update result', async () => {
      const warehouseProductBatchId = '4';
      const managerId = '1';

      const updateWarehouseProductBatchDto = new UpdateWarehouseProductBatchDto();
      updateWarehouseProductBatchDto.stock = 100;

      const updateResult = await warehousesController.updateWarehouseProductBatch(warehouseProductBatchId, managerId, updateWarehouseProductBatchDto)
    
      expect(updateResult).toBeInstanceOf(WarehouseProductBatch);
    });

    it('Test_case_ID: WarehousesController_4 -> Should return exception 409 - Conflict', async () => {
      try{
        const warehouseProductBatchId = '4';
        const managerId = '10';

        const updateWarehouseProductBatchDto = new UpdateWarehouseProductBatchDto();
        updateWarehouseProductBatchDto.stock = 100;

        await warehousesController.updateWarehouseProductBatch(warehouseProductBatchId, managerId, updateWarehouseProductBatchDto)
    
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

    it('Test_case_ID: WarehousesController_6 -> Should return exception 400 - Bad request', async () => {
      try{
        const warehouseProductBatchId = '4';
        const managerId = '10';

        const updateWarehouseProductBatchDto = new UpdateWarehouseProductBatchDto();
        updateWarehouseProductBatchDto.stock = -1;

        await warehousesController.updateWarehouseProductBatch(warehouseProductBatchId, managerId, updateWarehouseProductBatchDto)
    
        assert.fail();
      } catch(error){
        if(error instanceof HttpException){
          expect(error).toBeInstanceOf(BadRequestException);
        } else {
          assert.fail();
        }
      }
    });

    it('Test_case_ID: WarehousesController_7 -> Should return exception 400 - Bad request', async () => {
      try{
        const warehouseProductBatchId = '4';
        const managerId = '1';

        const updateWarehouseProductBatchDto = new UpdateWarehouseProductBatchDto();
        updateWarehouseProductBatchDto.stock = 0;

        await warehousesController.updateWarehouseProductBatch(warehouseProductBatchId, managerId, updateWarehouseProductBatchDto)
    
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

    it('Test_case_ID: WarehousesController_8 -> Should return exception 409 - Conflict', async () => {
      try{
        const warehouseProductBatchId = '1000000';
        const managerId = '1';

        const updateWarehouseProductBatchDto = new UpdateWarehouseProductBatchDto();
        updateWarehouseProductBatchDto.stock = 200;

        await warehousesController.updateWarehouseProductBatch(warehouseProductBatchId, managerId, updateWarehouseProductBatchDto)
    
        assert.fail();
      } catch(error){
        // console.log(error);
        
        if(error instanceof HttpException){
          expect(error).toBeInstanceOf(NotFoundException);
        } else {
          assert.fail();
        }
      }
    });
  });

  // describe('Call method without bearer token', () => {
  //   it('Test_case_ID: WarehousesController_ -> Should return exception 401 - Unauthorized', async () => {

  //   })
  // });

  // describe('Call method with wrong role', () => {
  //   it('Test_case_ID: WarehousesController_ -> Should return exception 403 - Forbidden', async () => {
      
  //   })
  // });
});
