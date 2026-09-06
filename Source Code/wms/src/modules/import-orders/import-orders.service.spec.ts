import { Test, TestingModule } from '@nestjs/testing';
import { ImportOrdersService } from './import-orders.service';
import { ImportOrder } from './entities/import-order.entity';
import { ImportOrderItem } from './entities/import-order-item.entity';
import { BullModule } from '@nestjs/bullmq';
import { BadRequestException, ConflictException, forwardRef, HttpException, NotFoundException } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryHistoriesModule } from '../inventory-histories/inventory-histories.module';
import { ProductsModule } from '../products/products.module';
import { WarehousesModule } from '../warehouses/warehouses.module';
import { ROOT_SETTING, TIMEOUT } from '../../utilities/constants/constants';
import { CreateImportOrderDto } from './dto/create-import-order.dto';
import { UpdateImportOrderDto } from './dto/update-import-order.dto';
import { CreateImportOrderItemDto } from './dto/create-import-order-item.dto';
import assert from 'assert';
import { InventoryHistoriesService } from '../inventory-histories/inventory-histories.service';

describe('ImportordersService', () => {
  let importOrdersService: ImportOrdersService;
  let inventoryHistoriesService : InventoryHistoriesService;
  let createdImportOrderId : string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ...ROOT_SETTING,
        TypeOrmModule.forFeature([
          ImportOrder, ImportOrderItem
        ]),
        InventoryHistoriesModule,
        ProductsModule,
        forwardRef(() => WarehousesModule),
        BullModule.registerQueue({
          name: 'importSuccessfulEmailQueue'
        })
      ],
      providers: [ImportOrdersService],
    }).compile();
    
    importOrdersService = module.get<ImportOrdersService>(ImportOrdersService);
    inventoryHistoriesService = module.get<InventoryHistoriesService>(InventoryHistoriesService);
  }, TIMEOUT.TEST_TIMEOUT);

  it('should be defined', () => {
    expect(importOrdersService).toBeDefined();
  });

  describe('create', () => {
    it('Test_case_ID: ImportOrdersService_1 -> Should return 201 can be return with create result', async () => {
      const warehouseId = '1';
      const warehouseStaffId = '1';
      const supplierId = '1';
      const expiredAt = (new Date()).toISOString().replace('T', ' ').replace('Z', '');
      const productId = '1';
      const quantity = 10;
      const unit = 'cái';

      const createImportOrderDto = new CreateImportOrderDto();
      createImportOrderDto.importDate = (new Date()).toISOString().replace('T', ' ').replace('Z', '');
      createImportOrderDto.warehouseId = warehouseId;
      createImportOrderDto.supplierId = supplierId;
      createImportOrderDto.warehouseStaffId = warehouseStaffId;

      const listImportOrderItemDto : CreateImportOrderItemDto[] = [];
      const importOrderItemDto = new CreateImportOrderItemDto();
      importOrderItemDto.productId = productId;
      importOrderItemDto.quantity = quantity;
      importOrderItemDto.unit = unit;
      importOrderItemDto.expiredAt = expiredAt;

      listImportOrderItemDto.push(importOrderItemDto);
      const importOrderItemDto_2 = new CreateImportOrderItemDto();
      importOrderItemDto_2.productId = '2';
      importOrderItemDto_2.quantity = 10;
      importOrderItemDto_2.unit = 'cái';
      importOrderItemDto_2.expiredAt = expiredAt;

      listImportOrderItemDto.push(importOrderItemDto_2);

      createImportOrderDto.listImportOrderItemDto = listImportOrderItemDto;

      const creatingResult = await importOrdersService.create(createImportOrderDto);
      createdImportOrderId = creatingResult.id;

      expect(creatingResult).toBeInstanceOf(ImportOrder);
      expect((await importOrdersService.findImportOrderItemByImportOrder(creatingResult.id)).length).toEqual(listImportOrderItemDto.length);
      expect((await inventoryHistoriesService.findProcessingHistoryByImportOrder(creatingResult.id)).length).toEqual(listImportOrderItemDto.length);
    });

    it('Test_case_ID: ImportOrdersService_2 -> Should return exception 409 - Conflict', async () => {
      try{
        const warehouseId = '1';
        const warehouseStaffId = '1000';
        const supplierId = '1';
        const expiredAt = (new Date()).toISOString().replace('T', ' ').replace('Z', '');
        const productId = '1';
        const quantity = 1;
        const unit = 'cái';

        const createImportOrderDto = new CreateImportOrderDto();
        createImportOrderDto.importDate = (new Date()).toISOString().replace('T', ' ').replace('Z', '');
        createImportOrderDto.warehouseId = warehouseId;
        createImportOrderDto.supplierId = supplierId;
        createImportOrderDto.warehouseStaffId = warehouseStaffId;

        const listImportOrderItemDto : CreateImportOrderItemDto[] = [];
        const importOrderItemDto = new CreateImportOrderItemDto();
        importOrderItemDto.productId = productId;
        importOrderItemDto.quantity = quantity;
        importOrderItemDto.unit = unit;
        importOrderItemDto.expiredAt = expiredAt;

        listImportOrderItemDto.push(importOrderItemDto);

        importOrderItemDto.productId = '';
        importOrderItemDto.quantity = 0;
        importOrderItemDto.unit = '';
        importOrderItemDto.expiredAt = expiredAt;

        listImportOrderItemDto.push(importOrderItemDto);

        createImportOrderDto.listImportOrderItemDto = listImportOrderItemDto;

        await importOrdersService.create(createImportOrderDto);
      } catch (error){
        if(error instanceof HttpException){
          if(error instanceof NotFoundException == false && error instanceof ConflictException == false){
            assert.fail();
          }
        } else {
          assert.fail();
        }
      }
    });

    it('Test_case_ID: ImportOrdersService_3 -> Should return exception 409 - Conflict', async () => {
      try{
        const warehouseId = '1';
        const warehouseStaffId = '1';
        const supplierId = '1';
        const expiredAt = (new Date()).toISOString().replace('T', ' ').replace('Z', '');
        const productId = '1000';
        const quantity = 1;
        const unit = 'cái';

        const createImportOrderDto = new CreateImportOrderDto();
        createImportOrderDto.importDate = (new Date()).toISOString().replace('T', ' ').replace('Z', '');
        createImportOrderDto.warehouseId = warehouseId;
        createImportOrderDto.supplierId = supplierId;
        createImportOrderDto.warehouseStaffId = warehouseStaffId;

        const listImportOrderItemDto : CreateImportOrderItemDto[] = [];
        const importOrderItemDto = new CreateImportOrderItemDto();
        importOrderItemDto.productId = productId;
        importOrderItemDto.quantity = quantity;
        importOrderItemDto.unit = unit;
        importOrderItemDto.expiredAt = expiredAt;

        listImportOrderItemDto.push(importOrderItemDto);

        importOrderItemDto.productId = '2';
        importOrderItemDto.quantity = 0;
        importOrderItemDto.unit = 'cái';
        importOrderItemDto.expiredAt = expiredAt;

        listImportOrderItemDto.push(importOrderItemDto);

        createImportOrderDto.listImportOrderItemDto = listImportOrderItemDto;

        await importOrdersService.create(createImportOrderDto);
      
        fail();
      } catch (error){
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

    it('Test_case_ID: ImportOrdersService_4 -> Should return exception 400 - Bad request', async () => {
      try{
        const warehouseId = '1';
        const warehouseStaffId = '1';
        const supplierId = '1';
        const expiredAt = (new Date()).toISOString().replace('T', ' ').replace('Z', '');
        const productId = '100000000000000000000000';
        const quantity = 1;
        const unit = 'cái';

        const createImportOrderDto = new CreateImportOrderDto();
        createImportOrderDto.importDate = (new Date()).toISOString().replace('T', ' ').replace('Z', '');
        createImportOrderDto.warehouseId = warehouseId;
        createImportOrderDto.supplierId = supplierId;
        createImportOrderDto.warehouseStaffId = warehouseStaffId;

        const listImportOrderItemDto : CreateImportOrderItemDto[] = [];
        const importOrderItemDto = new CreateImportOrderItemDto();
        importOrderItemDto.productId = productId;
        importOrderItemDto.quantity = quantity;
        importOrderItemDto.unit = unit;
        importOrderItemDto.expiredAt = expiredAt;

        listImportOrderItemDto.push(importOrderItemDto);

        importOrderItemDto.productId = '2';
        importOrderItemDto.quantity = 0;
        importOrderItemDto.unit = 'cái';
        importOrderItemDto.expiredAt = (new Date()).toISOString().replace('T', ' ').replace('Z', '');

        listImportOrderItemDto.push(importOrderItemDto);

        createImportOrderDto.listImportOrderItemDto = listImportOrderItemDto;

        await importOrdersService.create(createImportOrderDto);
      
        fail();
      } catch (error){
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

  describe('approveByManager', () => {
    it('Test_case_ID: ImportOrdersService_18 -> Should return 200 can be return with update result', async () => {
      const importOrderId = createdImportOrderId;
      const managerId = '1';
      const updateResult = await importOrdersService.approveByManager(importOrderId, managerId);

      expect(updateResult).toBeInstanceOf(ImportOrder);

      const listImportOrderItem = await importOrdersService.findImportOrderItemByImportOrder(updateResult.id);
      expect((await inventoryHistoriesService.findApprovedHistoriesByImportOrderItems(listImportOrderItem)).length).toEqual(listImportOrderItem.length);
    });

    it('Test_case_ID: ImportOrdersService_19 -> Should return exception 404 - Not found', async () => {
      try{
        const importOrderId = '100000';
        const managerId = '1';
        await importOrdersService.approveByManager(importOrderId, managerId); 
      } catch(error){
        // console.log(error);
        if(error instanceof HttpException){
          expect(error).toBeInstanceOf(NotFoundException);
        } else {
          assert.fail();
        }
      }
    });

    it('Test_case_ID: ImportOrdersService_20 -> Should return exception 409 - Conflict', async () => {
      try{
        const warehouseId = '1';
        const warehouseStaffId = '1';
        const supplierId = '1';
        const expiredAt = new Date();
        const productId = '1';
        const quantity = 10;
        const unit = 'cái';

        const createImportOrderDto = new CreateImportOrderDto();
        createImportOrderDto.importDate = (new Date()).toISOString().replace('T', ' ').replace('Z', '');
        createImportOrderDto.warehouseId = warehouseId;
        createImportOrderDto.supplierId = supplierId;
        createImportOrderDto.warehouseStaffId = warehouseStaffId;

        const listImportOrderItemDto : CreateImportOrderItemDto[] = [];
        const importOrderItemDto = new CreateImportOrderItemDto();
        importOrderItemDto.productId = productId;
        importOrderItemDto.quantity = quantity;
        importOrderItemDto.unit = unit;
        importOrderItemDto.expiredAt = (new Date()).toISOString().replace('T', ' ').replace('Z', '');

        listImportOrderItemDto.push(importOrderItemDto);
        const importOrderItemDto_2 = new CreateImportOrderItemDto();
        importOrderItemDto_2.productId = '2';
        importOrderItemDto_2.quantity = 10;
        importOrderItemDto_2.unit = 'cái';
        importOrderItemDto_2.expiredAt = (new Date()).toISOString().replace('T', ' ').replace('Z', '');

        listImportOrderItemDto.push(importOrderItemDto_2);

        createImportOrderDto.listImportOrderItemDto = listImportOrderItemDto;

        const creatcreatedResult = await importOrdersService.create(createImportOrderDto);

        const importOrderId = creatcreatedResult.id;
        const managerId = '1000';
        await importOrdersService.approveByManager(importOrderId, managerId); 
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

  // describe('removeByWarehouseStaff', () => {
  //   it('Test_case_ID: ImportOrdersService_ -> Should return 200 can be return with deleting result', async () => {
  //     const importOrderId = '1';
  //     const warehouseStaffId = '1';
  //     const deleteResult = await importOrdersService.removeByWarewhouseStaff(importOrderId, warehouseStaffId);

  //     expect(deleteResult).toBeInstanceOf(ImportOrder);
  //   });

  //   it('Test_case_ID: ImportOrdersService_ -> Should return exception 404 - Not found', async () => {
  //     try{
  //       const importOrderId = '1';
  //       const warehouseStaffId = '1';
  //       await importOrdersService.removeByWarewhouseStaff(importOrderId, warehouseStaffId);
  //     } catch(error){
  //       console.log(error);
  //       expect(error).toBeInstanceOf(NotFoundException);
  //     }
  //   });

  //   it('Test_case_ID: ImportOrdersService_ -> Should return exception 409 - Conflict', async () => {
  //     try{
  //       const importOrderId = '1';
  //       const warehouseStaffId = '1';
  //       await importOrdersService.removeByWarewhouseStaff(importOrderId, warehouseStaffId);
  //     } catch(error){
  //       console.log(error);
  //       expect(error).toBeInstanceOf(ConflictException);
  //     }
  //   });

  //   it('Test_case_ID: ImportOrdersService_ -> Should return exception 400 - Bad request', async () => {
  //     try{
  //       const importOrderId = '1';
  //       const warehouseStaffId = '1';
  //       await importOrdersService.removeByWarewhouseStaff(importOrderId, warehouseStaffId);
  //     } catch(error){
  //       console.log(error);
  //       expect(error).toBeInstanceOf(BadRequestException);
  //     }
  //   });

  //   it('Test_case_ID: ImportOrdersService_ -> Should return exception 409 - Conflict', async () => {
  //     try{
  //       const importOrderId = '1';
  //       const warehouseStaffId = '1';
  //       await importOrdersService.removeByWarewhouseStaff(importOrderId, warehouseStaffId);
  //     } catch(error){
  //       console.log(error);
  //       expect(error).toBeInstanceOf(ConflictException);
  //     }
  //   });
  // });

  // describe('updateByWarehouseStaff', () => {
  //   it('Test_case_ID: ImportOrdersService_ -> Should return 200 can be return with update result', async () => {
  //     const importOrderId = '1';
  //     const updateImportOrderDto = new UpdateImportOrderDto();
  //     const updateResult = await importOrdersService.updateByWarehouseStaff(importOrderId, updateImportOrderDto);

  //     expect(updateResult).toBeInstanceOf(ImportOrder);
  //   });

  //   it('Test_case_ID: ImportOrdersService_ -> Should return exception 404 - Not found', async () => {
  //     try{
  //       const importOrderId = '1';
  //       const updateImportOrderDto = new UpdateImportOrderDto();
  //       await importOrdersService.updateByWarehouseStaff(importOrderId, updateImportOrderDto);
      
  //       fail();
  //     } catch (error){
  //       console.log(error);
  //       expect(error).toBeInstanceOf(NotFoundException);
  //     }
  //   });

  //   it('Test_case_ID: ImportOrdersService_ -> Should return exception 409 - Conflict', async () => {
  //     try{
  //       const importOrderId = '1';
  //       const updateImportOrderDto = new UpdateImportOrderDto();
  //       await importOrdersService.updateByWarehouseStaff(importOrderId, updateImportOrderDto);
      
  //       fail();
  //     } catch (error){
  //       console.log(error);
  //       expect(error).toBeInstanceOf(ConflictException);
  //     }
  //   });

  //   it('Test_case_ID: ImportOrdersService_ -> Should return exception 400 - Bad request', async () => {
  //     try{
  //       const importOrderId = '1';
  //       const updateImportOrderDto = new UpdateImportOrderDto();
  //       await importOrdersService.updateByWarehouseStaff(importOrderId, updateImportOrderDto);
      
  //       fail();
  //     } catch (error){
  //       console.log(error);
  //       expect(error).toBeInstanceOf(BadRequestException);
  //     }
  //   });

  //   it('Test_case_ID: ImportOrdersService_ -> Should return exception 409 - Conflict', async () => {
  //     try{
  //       const importOrderId = '1';
  //       const updateImportOrderDto = new UpdateImportOrderDto();
  //       await importOrdersService.updateByWarehouseStaff(importOrderId, updateImportOrderDto);
      
  //       fail();
  //     } catch (error){
  //       console.log(error);
  //       expect(error).toBeInstanceOf(ConflictException);
  //     }
  //   });
  // });

  // describe('find', () => {
  //   it('Test_case_ID: ImportOrdersService_ -> Should return 200 with finding result', async () => {
  //     const listWarehouseId = [];
  //     const listStatus = [];
  //     const sortBy = [];
  //     const orders = [];
  //     const limit = 5;
  //     const offset = 0;
  //     const fingingResult = await importOrdersService.find(listWarehouseId, listStatus, sortBy, orders, limit, offset);

  //     expect(fingingResult).toHaveReturned();
  //     expect(fingingResult[0]).toBeInstanceOf(ImportOrder);
  //   });

  //   it('Test_case_ID: ImportOrdersService_ -> Should return exception 400 - Bad request', async () => {
  //     try{
  //       const listWarehouseId = [];
  //       const listStatus = [];
  //       const sortBy = [];
  //       const orders = [];
  //       const limit = 5;
  //       const offset = 0;
  //       const fingingResult = await importOrdersService.find(listWarehouseId, listStatus, sortBy, orders, limit, offset);

  //       expect(fingingResult).toHaveReturned();
  //       expect(fingingResult[0]).toBeInstanceOf(ImportOrder);
  //     } catch(error){
  //       console.log(error);
  //       expect(error).toBeInstanceOf(HttpException);
  //     }
  //   });

  //   it('Test_case_ID: ImportOrdersService_ -> Should return exception 404 - Not found', async () => {
  //     try{
  //       const listWarehouseId = [];
  //       const listStatus = [];
  //       const sortBy = [];
  //       const orders = [];
  //       const limit = 5;
  //       const offset = 0;
  //       const fingingResult = await importOrdersService.find(listWarehouseId, listStatus, sortBy, orders, limit, offset);

  //       expect(fingingResult).toHaveReturned();
  //       expect(fingingResult[0]).toBeInstanceOf(ImportOrder);
  //     } catch(error){
  //       console.log(error);
  //       expect(error).toBeInstanceOf(HttpException);
  //     }
  //   });
  // });

  // describe('findOne', () => {
  //   it('Test_case_ID: ImportOrdersService_ -> Should return 200 with finding result', async () => {
  //     const importOrderId = '1';
  //     const findingResult = await importOrdersService.findOne(importOrderId);

  //     expect(findingResult).toBeInstanceOf(ImportOrder);
  //   });

  //   it('Test_case_ID: ImportOrdersService_ -> Should return exception 404 - Not found', async () => {
  //     try {
  //       const importOrderId = '1';
  //       await importOrdersService.findOne(importOrderId);
  //     } catch(error) {
  //       if(error instanceof HttpException){
  //         expect(error).toBeInstanceOf(NotFoundException);
  //       } else {
  //         assert.fail();
  //       }
  //     }
  //   });

  //   it('Test_case_ID: ImportOrdersService_ -> Should return exception 400 - Bad request', async () => {
  //     try {
  //       const importOrderId = '1';
  //       await importOrdersService.findOne(importOrderId);
  //     } catch(error) {
  //       if(error instanceof HttpException){
  //         expect(error).toBeInstanceOf(NotFoundException);
  //       } else {
  //         assert.fail();
  //       }
  //     }
  //   });
  // });
});
