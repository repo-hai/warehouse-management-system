import { Test, TestingModule } from '@nestjs/testing';
import { ExportOrdersService } from './export-orders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportOrder } from './entities/export-order.entity';
import { ExportOrderItem } from './entities/export-order-item.entity';
import { ConflictException, forwardRef, HttpException, NotFoundException } from '@nestjs/common';
import { AgentsModule } from '../agents/agents.module';
import { InventoryHistoriesModule } from '../inventory-histories/inventory-histories.module';
import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';
import { WarehousesModule } from '../warehouses/warehouses.module';
import { ROOT_SETTING, TIMEOUT } from '../../utilities/constants/constants';
import { CreateExportOrderDto } from './dto/create-export-order.dto';
import { UpdateExportOrderByManagerDto } from './dto/update-export-order-by-manager.dto';
import assert from 'assert';
import { CreateExportOrderItemDto } from './dto/create-export-order-item.dto';
import { CreateWarehouseProductBatchDto } from '../warehouses/dto/create-warehoue-product-batch.dto';

describe('ExportordersService', () => {
  let exportOrdersService: ExportOrdersService;
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
      providers: [ExportOrdersService],
    }).compile();

    exportOrdersService = module.get<ExportOrdersService>(ExportOrdersService);
  }, TIMEOUT.TEST_TIMEOUT);

  it('should be defined', () => {
    expect(exportOrdersService).toBeDefined();
  });

  describe('create', () => {
    it('Test_case_ID: ExportOrdersService_1 -> Should return 201 can be return with create result', async () => {
      const createExportOrderDto = new CreateExportOrderDto();
      createExportOrderDto.currentTimeStamp = Date.now();
      createExportOrderDto.exportedAt = (new Date()).toISOString().replace('T', ' ').replace('Z', '');
      createExportOrderDto.warehouseId = '1';
      createExportOrderDto.warehouseStaffId = '2';
      createExportOrderDto.agentId = '1';

      const createExportOrderItemDto = new CreateExportOrderItemDto();
      createExportOrderItemDto.productId = '1';

      const warehouseProductBatchDto = new CreateWarehouseProductBatchDto();
      warehouseProductBatchDto.id = '6';
      warehouseProductBatchDto.quantity = 1;
      createExportOrderItemDto.listWarehouseProductBatchDto = [warehouseProductBatchDto];

      createExportOrderDto.listExportOrderItemDto = [createExportOrderItemDto];

      const createdResult = await exportOrdersService.create(createExportOrderDto);
      createdExportOrderId = createdResult.id;

      expect(createdResult).toBeInstanceOf(ExportOrder);
    });

    it('Test_case_ID: ExportOrdersService_2 -> Should return exception 409 - Conflict', async () => {
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

        await exportOrdersService.create(createExportOrderDto);

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

    it('Test_case_ID: ExportOrdersService_3 -> Should return exception 409 - Conflict', async () => {
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

        await exportOrdersService.create(createExportOrderDto);

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

    it('Test_case_ID: ExportOrdersService_4 -> Should return exception 409 - Conflict', async () => {
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

        await exportOrdersService.create(createExportOrderDto);

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

    it('Test_case_ID: ExportOrdersService_5 -> Should return exception 409 - Conflict', async () => {
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

        await exportOrdersService.create(createExportOrderDto);

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

    it('Test_case_ID: ExportOrdersService_6 -> Should return exception 400 - Bad request', async () => {
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

        await exportOrdersService.create(createExportOrderDto);

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

  describe('approveByManager', () => {
    it('Test_case_ID: ExportOrdersService_21 -> Should return 200 can be return with update result', async () => {
      const updateExportOrderByManagerDto = new UpdateExportOrderByManagerDto();
      const managerId = '1';
      updateExportOrderByManagerDto.exportOrderId = createdExportOrderId;
      updateExportOrderByManagerDto.warehouseId = '1';

      const updatedResult = await exportOrdersService.approveByManager(managerId, updateExportOrderByManagerDto);
    
      expect(updatedResult).toBeInstanceOf(ExportOrder);
    });

    it('Test_case_ID: ExportOrdersService_22 -> Should return exception 404 - Not found', async () => {
      try{
        const updateExportOrderByManagerDto = new UpdateExportOrderByManagerDto();
        const managerId = '1';
        updateExportOrderByManagerDto.exportOrderId = '10000000';
        updateExportOrderByManagerDto.warehouseId = '1';

        await exportOrdersService.approveByManager(managerId, updateExportOrderByManagerDto);

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

        await exportOrdersService.approveByManager(managerId, updateExportOrderByManagerDto);

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

  // describe('find', () => {
  //   it('Test_case_ID: ExportOrdersService_ -> Should return 200 with finding result', async () => {
  //     const listWarehouseId = [];
  //     const listStatus = [];
  //     const sortBy = [];
  //     const orders = [];
  //     const limit = 1;
  //     const offset = 0;
  //     const findingResult = await exportOrdersService.find(listWarehouseId, listStatus, sortBy, orders, limit, offset);

  //     expect(findingResult).toBeDefined();
  //   });

  //   it('Test_case_ID: ExportOrdersService_ -> Should return exception 400 - Bad request', async () => {
  //     try{
  //       const listWarehouseId = [];
  //       const listStatus = [];
  //       const sortBy = [];
  //       const orders = [];
  //       const limit = 1;
  //       const offset = 0;
  //       await exportOrdersService.find(listWarehouseId, listStatus, sortBy, orders, limit, offset);

  //       fail();
  //     }catch(error){
  //       console.log(error);
  //       expect(error).toBeInstanceOf(InternalServerErrorException);
  //     }
  //   });

  //   it('Test_case_ID: ExportOrdersService_ -> Should return exception 404 - Not found', async () => {
  //     try{
  //       const listWarehouseId = [];
  //       const listStatus = [];
  //       const sortBy = [];
  //       const orders = [];
  //       const limit = 1;
  //       const offset = 0;
  //       await exportOrdersService.find(listWarehouseId, listStatus, sortBy, orders, limit, offset);

  //       fail();
  //     }catch(error){
  //       console.log(error);
  //       expect(error).toBeInstanceOf(NotFoundException);
  //     }
  //   });
  // });

  // describe('findOne', () => {
  //   it('Test_case_ID: ExportOrdersService_ -> Should return 200 with finding result', async () => {
  //     const exportOrderId = '1';
  //     const findingResult = await exportOrdersService.findOne(exportOrderId);

  //     expect(findingResult).toBeInstanceOf(ExportOrder);
  //   });

  //   it('Test_case_ID: ExportOrdersService_ -> Should return exception 404 - Not found', async () => {
  //     try{
  //       const exportOrderId = '1';
  //       await exportOrdersService.findOne(exportOrderId);

  //       fail();
  //     }catch(error){
  //       console.log(error);
  //       expect(error).toBeInstanceOf(NotFoundException);
  //     }
  //   });

  //   it('Test_case_ID: ExportOrdersService_ -> Should return exception 400 - Bad request', async () => {
  //     try{
  //       const exportOrderId = '1';
  //       await exportOrdersService.findOne(exportOrderId);

  //       fail();
  //     }catch(error){
  //       console.log(error);
  //       expect(error).toBeInstanceOf(BadRequestException);
  //     }
  //   });
  // });

  // describe('updateByWarehouseStaff', () => {
  //   it('Test_case_ID: ExportOrdersService_ -> Should return 200 can be return with update result', async () => {
  //     const exportOrderId = '1';
  //     const updateExportOrderDto = new UpdateExportOrderDto();
      
  //     const updatingResult = await exportOrdersService.updateByWarehouseStaff(exportOrderId, updateExportOrderDto);

  //     expect(updatingResult).toBeInstanceOf(ExportOrder);
  //   });

  //   it('Test_case_ID: ExportOrdersService_ -> Should return 200 can be return with update result', async () => {
  //     const exportOrderId = '1';
  //     const updateExportOrderDto = new UpdateExportOrderDto();
      
  //     const updatingResult = await exportOrdersService.updateByWarehouseStaff(exportOrderId, updateExportOrderDto);

  //     expect(updatingResult).toBeInstanceOf(ExportOrder);
  //   });

  //   it('Test_case_ID: ExportOrdersService_ -> Should return exception 404 - Not found', async () => {
  //     try{
  //       const exportOrderId = '1';
  //       const updateExportOrderDto = new UpdateExportOrderDto();
      
  //       await exportOrdersService.updateByWarehouseStaff(exportOrderId, updateExportOrderDto);
   
  //       fail();
  //     } catch(error){
  //       console.log(error);
  //       expect(error).toBeInstanceOf(NotFoundException);
  //     }
  //   });

  //   it('Test_case_ID: ExportOrdersService_ -> Should return exception 400 - Bad request', async () => {
  //     try{
  //       const exportOrderId = '1';
  //       const updateExportOrderDto = new UpdateExportOrderDto();
      
  //       await exportOrdersService.updateByWarehouseStaff(exportOrderId, updateExportOrderDto);
   
  //       fail();
  //     } catch(error){
  //       console.log(error);
  //       expect(error).toBeInstanceOf(BadRequestException);
  //     }
  //   });

  //   it('Test_case_ID: ExportOrdersService_ -> Should return exception 409 - Conflict', async () => {
  //     try{
  //       const exportOrderId = '1';
  //       const updateExportOrderDto = new UpdateExportOrderDto();
      
  //       await exportOrdersService.updateByWarehouseStaff(exportOrderId, updateExportOrderDto);
   
  //       fail();
  //     } catch(error){
  //       console.log(error);
  //       expect(error).toBeInstanceOf(ConflictException);
  //     }
  //   });

  //   it('Test_case_ID: ExportOrdersService_ -> Should return exception 409 - Conflict', async () => {
  //     try{
  //       const exportOrderId = '1';
  //       const updateExportOrderDto = new UpdateExportOrderDto();
      
  //       await exportOrdersService.updateByWarehouseStaff(exportOrderId, updateExportOrderDto);
   
  //       fail();
  //     } catch(error){
  //       console.log(error);
  //       expect(error).toBeInstanceOf(ConflictException);
  //     }
  //   });

  //   it('Test_case_ID: ExportOrdersService_ -> Should return exception 409 - Conflict', async () => {
  //     try{
  //       const exportOrderId = '1';
  //       const updateExportOrderDto = new UpdateExportOrderDto();
      
  //       await exportOrdersService.updateByWarehouseStaff(exportOrderId, updateExportOrderDto);
   
  //       fail();
  //     } catch(error){
  //       console.log(error);
  //       expect(error).toBeInstanceOf(ConflictException);
  //     }
  //   });
  // });

  // describe('removeByWarehouseStaff', () => {
  //   it('Test_case_ID: ExportOrdersService_ -> Should return 200 can be return with deleting result', async () => {
  //     const exportOrderId = '1';
  //     const warehouseStaffId = '1';
  //     const deletingResult = await exportOrdersService.removeByWarehouseStaff(exportOrderId, warehouseStaffId);

  //     expect(deletingResult).toBeInstanceOf(ExportOrder);
  //   });

  //   it('Test_case_ID: ExportOrdersService_ -> Should return exception 404 - Not found', async () => {
  //     try{
  //       const exportOrderId = '1';
  //       const warehouseStaffId = '1';
  //       await exportOrdersService.removeByWarehouseStaff(exportOrderId, warehouseStaffId);

  //       fail();
  //     } catch(error){
  //       console.log(error);
  //       expect(error).toBeInstanceOf(NotFoundException);
  //     }
  //   });

  //   it('Test_case_ID: ExportOrdersService_ -> Should return exception 409 - Conflict', async () => {
  //     try{
  //       const exportOrderId = '1';
  //       const warehouseStaffId = '1';
  //       await exportOrdersService.removeByWarehouseStaff(exportOrderId, warehouseStaffId);

  //       fail();
  //     } catch(error){
  //       console.log(error);
  //       expect(error).toBeInstanceOf(ConflictException);
  //     }
  //   });

  //   it('Test_case_ID: ExportOrdersService_ -> Should return exception 400 - Bad request', async () => {
  //     try{
  //       const exportOrderId = '1';
  //       const warehouseStaffId = '1';
  //       await exportOrdersService.removeByWarehouseStaff(exportOrderId, warehouseStaffId);

  //       fail();
  //     } catch(error){
  //       console.log(error);
  //       expect(error).toBeInstanceOf(BadRequestException);
  //     }
  //   });

  //   it('Test_case_ID: ExportOrdersService_ -> Should return exception 409 - Conflict', async () => {
  //     try{
  //       const exportOrderId = '1';
  //       const warehouseStaffId = '1';
  //       await exportOrdersService.removeByWarehouseStaff(exportOrderId, warehouseStaffId);

  //       fail();
  //     } catch(error){
  //       console.log(error);
  //       expect(error).toBeInstanceOf(ConflictException);
  //     }
  //   });
  // });

  // describe('removeByManager', () => {
  //   it('Test_case_ID: ExportOrdersService_ -> Should return 200 can be return with deleting result', async () => {
  //     const exportOrderId = '1';
  //     const maangerId = '1';
  //     const deletingResult = await exportOrdersService.removeByManager(exportOrderId, maangerId);

  //     expect(deletingResult).toBeInstanceOf(ExportOrder);
  //   });

  //   it('Test_case_ID: ExportOrdersService_ -> Should return 200 can be return with deleting result', async () => {
  //     const exportOrderId = '1';
  //     const maangerId = '1';
  //     const deletingResult = await exportOrdersService.removeByManager(exportOrderId, maangerId);

  //     expect(deletingResult).toBeInstanceOf(ExportOrder);    
  //   });

  //   it('Test_case_ID: ExportOrdersService_ -> Should return exception 404 - Not found', async () => {
  //     try{
  //       const exportOrderId = '1';
  //       const maangerId = '1';
  //       await exportOrdersService.removeByManager(exportOrderId, maangerId);

  //       fail();
  //     } catch(error){
  //       console.log(error);
  //       expect(error).toBeInstanceOf(NotFoundException);
  //     }
  //   });

  //   it('Test_case_ID: ExportOrdersService_ -> Should return exception 400 - Bad request', async () => {
  //     try{
  //       const exportOrderId = '1';
  //       const maangerId = '1';
  //       await exportOrdersService.removeByManager(exportOrderId, maangerId);

  //       fail();
  //     } catch(error){
  //       console.log(error);
  //       expect(error).toBeInstanceOf(BadRequestException);
  //     }
  //   });

  //   it('Test_case_ID: ExportOrdersService_ -> Should return exception 409 - Conflict', async () => {
  //     try{
  //       const exportOrderId = '1';
  //       const maangerId = '1';
  //       await exportOrdersService.removeByManager(exportOrderId, maangerId);

  //       fail();
  //     } catch(error){
  //       console.log(error);
  //       expect(error).toBeInstanceOf(ConflictException);
  //     }
  //   });
  // });
});
