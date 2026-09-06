import { Test, TestingModule } from '@nestjs/testing';
import { ExportOrdersController } from './export-orders.controller';
import { ExportOrdersService } from './export-orders.service';
import { BadRequestException, ConflictException, forwardRef, HttpException, NotFoundException } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentsModule } from '../agents/agents.module';
import { InventoryHistoriesModule } from '../inventory-histories/inventory-histories.module';
import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';
import { WarehousesModule } from '../warehouses/warehouses.module';
import { ExportOrderItem } from './entities/export-order-item.entity';
import { ExportOrder } from './entities/export-order.entity';
import { ROOT_SETTING, TIMEOUT } from '../../utilities/constants/constants';
import assert from 'assert';
import { CreateWarehouseProductBatchDto } from '../warehouses/dto/create-warehoue-product-batch.dto';
import { CreateExportOrderItemDto } from './dto/create-export-order-item.dto';
import { CreateExportOrderDto } from './dto/create-export-order.dto';
import { UpdateExportOrderByManagerDto } from './dto/update-export-order-by-manager.dto';

describe('ExportOrdersController', () => {
  let exportOrdersController: ExportOrdersController;
  let createdExportOrderId : string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ...ROOT_SETTING,
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
    }).compile();

    exportOrdersController = module.get<ExportOrdersController>(ExportOrdersController);
  }, TIMEOUT.TEST_TIMEOUT);

  it('should be defined', () => {
    expect(exportOrdersController).toBeDefined();
  });

  describe('create - POST /exportOrders', () => {
    it('Test_case_ID: ExportOrdersController_3 -> Should return 201 can be return with create result', async () => {
      const createExportOrderDto = new CreateExportOrderDto();
      createExportOrderDto.currentTimeStamp = Date.now();
      createExportOrderDto.exportedAt = (new Date()).toISOString().replace('T', ' ').replace('Z', '');
      createExportOrderDto.warehouseId = '1';
      createExportOrderDto.warehouseStaffId = '2';
      createExportOrderDto.agentId = '1';

      const createExportOrderItemDto = new CreateExportOrderItemDto();
      createExportOrderItemDto.productId = '1';
      createExportOrderItemDto.quantity = 1;

      createExportOrderDto.listExportOrderItemDto = [createExportOrderItemDto];

      const createdResult = await exportOrdersController.create(createExportOrderDto);
      createdExportOrderId = createdResult.id;

      expect(createdResult).toBeInstanceOf(ExportOrder);
    });

    it('Test_case_ID: ExportOrdersController_4 -> Should return exception 409 - Conflict', async () => {
      try{
        const createExportOrderDto = new CreateExportOrderDto();
        createExportOrderDto.currentTimeStamp = Date.now();
        createExportOrderDto.exportedAt = (new Date()).toISOString().replace('T', ' ').replace('Z', '');
        createExportOrderDto.warehouseId = '1';
        createExportOrderDto.warehouseStaffId = '2';
        createExportOrderDto.agentId = '1';

        const createExportOrderItemDto = new CreateExportOrderItemDto();
        createExportOrderItemDto.productId = '1';
        createExportOrderItemDto.quantity = 1000;

        const warehouseProductBatchDto = new CreateWarehouseProductBatchDto();
        warehouseProductBatchDto.id = '6';
        warehouseProductBatchDto.quantity = 1000;
        createExportOrderItemDto.listWarehouseProductBatchDto = [warehouseProductBatchDto];

        createExportOrderDto.listExportOrderItemDto = [createExportOrderItemDto];

        await exportOrdersController.create(createExportOrderDto);

        assert.fail();
      } catch(error){
        // console.log(error);
        if(error instanceof HttpException){
          expect(error).toBeInstanceOf(ConflictException);
        } else {
          assert.fail();
        }
      }
    });

    it('Test_case_ID: ExportOrdersController_5 -> Should return exception 409 - Conflict', async () => {
      try{
        const createExportOrderDto = new CreateExportOrderDto();
        createExportOrderDto.currentTimeStamp = Date.now();
        createExportOrderDto.exportedAt = (new Date()).toISOString().replace('T', ' ').replace('Z', '');
        createExportOrderDto.warehouseId = '1';
        createExportOrderDto.warehouseStaffId = '100';
        createExportOrderDto.agentId = '1';

        const createExportOrderItemDto = new CreateExportOrderItemDto();
        createExportOrderItemDto.productId = '1';
        createExportOrderItemDto.quantity = 1;

        const warehouseProductBatchDto = new CreateWarehouseProductBatchDto();
        warehouseProductBatchDto.id = '6';
        warehouseProductBatchDto.quantity = 1;
        createExportOrderItemDto.listWarehouseProductBatchDto = [warehouseProductBatchDto];

        createExportOrderDto.listExportOrderItemDto = [createExportOrderItemDto];

        await exportOrdersController.create(createExportOrderDto);

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

    it('Test_case_ID: ExportOrdersController_6 -> Should return exception 409 - Conflict', async () => {
      try{
        const createExportOrderDto = new CreateExportOrderDto();
        createExportOrderDto.currentTimeStamp = Date.now();
        createExportOrderDto.exportedAt = (new Date()).toISOString().replace('T', ' ').replace('Z', '');
        createExportOrderDto.warehouseId = '1';
        createExportOrderDto.warehouseStaffId = '2';
        createExportOrderDto.agentId = '1';

        const createExportOrderItemDto = new CreateExportOrderItemDto();
        createExportOrderItemDto.productId = '3';
        createExportOrderItemDto.quantity = 1;

        createExportOrderDto.listExportOrderItemDto = [createExportOrderItemDto];

        await exportOrdersController.create(createExportOrderDto);

        assert.fail();
      } catch(error){
        // console.log(error);
        if(error instanceof HttpException){
          expect(error).toBeInstanceOf(ConflictException);
        } else {
          assert.fail();
        }
      }
    });

    it('Test_case_ID: ExportOrdersController_7 -> Should return exception 409 - Conflict', async () => {
      try{
        const createExportOrderDto = new CreateExportOrderDto();
        createExportOrderDto.currentTimeStamp = Date.now();
        createExportOrderDto.exportedAt = (new Date()).toISOString().replace('T', ' ').replace('Z', '');
        createExportOrderDto.warehouseId = '1';
        createExportOrderDto.warehouseStaffId = '2';
        createExportOrderDto.agentId = '1';

        const createExportOrderItemDto = new CreateExportOrderItemDto();
        createExportOrderItemDto.productId = '300000';
        createExportOrderItemDto.quantity = 1;

        createExportOrderDto.listExportOrderItemDto = [createExportOrderItemDto];

        await exportOrdersController.create(createExportOrderDto);

        assert.fail();
      } catch(error){
        //console.log(error);
        if(error instanceof HttpException){
          expect(error).toBeInstanceOf(ConflictException);
        } else {
          assert.fail();
        }
      }
    });

    it('Test_case_ID: ExportOrdersController_8 -> Should return exception 400 - Bad request', async () => {
      try{
        const createExportOrderDto = new CreateExportOrderDto();
        createExportOrderDto.currentTimeStamp = Date.now();
        createExportOrderDto.exportedAt = (new Date()).toISOString().replace('T', ' ').replace('Z', '');
        createExportOrderDto.warehouseId = '1';
        createExportOrderDto.warehouseStaffId = '2';
        createExportOrderDto.agentId = '1';

        const createExportOrderItemDto = new CreateExportOrderItemDto();
        createExportOrderItemDto.productId = '10000000';
        createExportOrderItemDto.quantity = 1;

        createExportOrderDto.listExportOrderItemDto = [createExportOrderItemDto];

        await exportOrdersController.create(createExportOrderDto);

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
  });

  describe('approveByManager - PUT /exportOrders/:id', () => {
    it('Test_case_ID: ExportOrdersService_21 -> Should return 200 can be return with update result', async () => {
      const updateExportOrderByManagerDto = new UpdateExportOrderByManagerDto();
      const managerId = '1';
      updateExportOrderByManagerDto.exportOrderId = createdExportOrderId;
      updateExportOrderByManagerDto.warehouseId = '1';

      const updatedResult = await exportOrdersController.approveByManager(managerId, updateExportOrderByManagerDto);
    
      expect(updatedResult).toBeInstanceOf(ExportOrder);
    });

    it('Test_case_ID: ExportOrdersService_22 -> Should return exception 404 - Not found', async () => {
      try{
        const updateExportOrderByManagerDto = new UpdateExportOrderByManagerDto();
        const managerId = '1';
        updateExportOrderByManagerDto.exportOrderId = '10000000';
        updateExportOrderByManagerDto.warehouseId = '1';

        await exportOrdersController.approveByManager(managerId, updateExportOrderByManagerDto);

        assert.fail();
      } catch(error){
        if(error instanceof HttpException){
          expect(error).toBeInstanceOf(NotFoundException);
        } else {
          assert.fail();
        }
      }
    });

    it('Test_case_ID: ExportOrdersService_23 -> Should return exception 409 - Conflict', async () => {
      try{
        const updateExportOrderByManagerDto = new UpdateExportOrderByManagerDto();
        const managerId = '100000';
        updateExportOrderByManagerDto.exportOrderId = '50';
        updateExportOrderByManagerDto.warehouseId = '1';

        await exportOrdersController.approveByManager(managerId, updateExportOrderByManagerDto);

        assert.fail();
      } catch(error){
        //console.log(error);
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

  // describe('find - GET /exportOrders', () => {
  //   it('Test_case_ID: ExportOrdersService_ -> Should return 200 with finding result', async () => {

  //   });

  //   it('Test_case_ID: ExportOrdersService_ -> Should return exception 400 - Bad request', async () => {

  //   });

  //   it('Test_case_ID: ExportOrdersService_ -> Should return exception 404 - Not found', async () => {

  //   });
  // });

  // describe('findOne - GET /exportOrders/:id', () => {
  //   it('Test_case_ID: ExportOrdersService_ -> Should return 200 with finding result', async () => {

  //   });

  //   it('Test_case_ID: ExportOrdersService_ -> Should return exception 404 - Not found', async () => {

  //   });

  //   it('Test_case_ID: ExportOrdersService_ -> Should return exception 400 - Bad request', async () => {

  //   });
  // });

  // describe('updateByWarehouseStaff - PUT /exportOrders/:id', () => {
  //   it('Test_case_ID: ExportOrdersService_ -> Should return 200 can be return with update result', async () => {

  //   });

  //   it('Test_case_ID: ExportOrdersService_ -> Should return 200 can be return with update result', async () => {

  //   });

  //   it('Test_case_ID: ExportOrdersService_ -> Should return exception 404 - Not found', async () => {

  //   });

  //   it('Test_case_ID: ExportOrdersService_ -> Should return exception 400 - Bad request', async () => {

  //   });

  //   it('Test_case_ID: ExportOrdersService_ -> Should return exception 409 - Conflict', async () => {

  //   });

  //   it('Test_case_ID: ExportOrdersService_ -> Should return exception 409 - Conflict', async () => {

  //   });

  //   it('Test_case_ID: ExportOrdersService_ -> Should return exception 409 - Conflict', async () => {

  //   });
  // });

  // describe('removeByWarehouseStaff - DELTE /exportOrders/:id', () => {
  //   it('Test_case_ID: ExportOrdersService_ -> Should return 200 can be return with deleting result', async () => {

  //   });

  //   it('Test_case_ID: ExportOrdersService_ -> Should return exception 404 - Not found', async () => {

  //   });

  //   it('Test_case_ID: ExportOrdersService_ -> Should return exception 409 - Conflict', async () => {

  //   });

  //   it('Test_case_ID: ExportOrdersService_ -> Should return exception 400 - Bad request', async () => {

  //   });

  //   it('Test_case_ID: ExportOrdersService_ -> Should return exception 409 - Conflict', async () => {

  //   });
  // });

  // describe('removeByManager - DELETE /exportOrders/:id/byManager', () => {
  //   it('Test_case_ID: ExportOrdersService_ -> Should return 200 can be return with deleting result', async () => {

  //   });

  //   it('Test_case_ID: ExportOrdersService_ -> Should return 200 can be return with deleting result', async () => {

  //   });

  //   it('Test_case_ID: ExportOrdersService_ -> Should return exception 404 - Not found', async () => {

  //   });

  //   it('Test_case_ID: ExportOrdersService_ -> Should return exception 400 - Bad request', async () => {

  //   });

  //   it('Test_case_ID: ExportOrdersService_ -> Should return exception 409 - Conflict', async () => {

  //   });
  // });

  // describe('Call method without bearer token', () => {
  //   it('Test_case_ID: ExportOrdersController_ -> Should return exception 401 - Unauthorized', async () => {
      
  //   })
  // });

  // describe('Call method with wrong role', () => {
  //   it('Test_case_ID: ExportOrdersController_ -> Should return exception 403 - Forbidden', async () => {
      
  //   })
  // });
});
