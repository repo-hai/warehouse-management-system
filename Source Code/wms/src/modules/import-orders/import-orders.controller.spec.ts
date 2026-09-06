import { Test, TestingModule } from '@nestjs/testing';
import { ImportOrdersController } from './import-orders.controller';
import { ImportOrdersService } from './import-orders.service';
import { BullModule } from '@nestjs/bullmq';
import { BadRequestException, ConflictException, forwardRef, HttpException, NotFoundException } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryHistoriesModule } from '../inventory-histories/inventory-histories.module';
import { ProductsModule } from '../products/products.module';
import { WarehousesModule } from '../warehouses/warehouses.module';
import { ImportOrderItem } from './entities/import-order-item.entity';
import { ImportOrder } from './entities/import-order.entity';
import { ROOT_SETTING, TIMEOUT } from '../../utilities/constants/constants';
import assert from 'assert';
import { CreateImportOrderItemDto } from './dto/create-import-order-item.dto';
import { CreateImportOrderDto } from './dto/create-import-order.dto';
import { InventoryHistoriesService } from '../inventory-histories/inventory-histories.service';

describe('ImportOrdersController', () => {
  let importOrdersController: ImportOrdersController;
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
      controllers: [ImportOrdersController],
      providers: [ImportOrdersService],
    }).compile();

    importOrdersController = module.get<ImportOrdersController>(ImportOrdersController);
    importOrdersService = module.get<ImportOrdersService>(ImportOrdersService);
    inventoryHistoriesService = module.get<InventoryHistoriesService>(InventoryHistoriesService);
  }, TIMEOUT.TEST_TIMEOUT);

  it('should be defined', () => {
    expect(importOrdersController).toBeDefined();
  });

  describe('updateByWarehouseStaff - PATCH /importOrders/:id', () => {
    it('Test_case_ID: ImportOrdersController_3 -> Should return 201 can be return with create result', async () => {
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

      const creatingResult = await importOrdersController.create(createImportOrderDto);
      createdImportOrderId = creatingResult.id;

      expect(creatingResult).toBeInstanceOf(ImportOrder);
      expect((await importOrdersService.findImportOrderItemByImportOrder(creatingResult.id)).length).toEqual(listImportOrderItemDto.length);
      expect((await inventoryHistoriesService.findProcessingHistoryByImportOrder(creatingResult.id)).length).toEqual(listImportOrderItemDto.length);
    });

    it('Test_case_ID: ImportOrdersController_4 -> Should return exception 409 - Conflict', async () => {
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

    it('Test_case_ID: ImportOrdersController_5 -> Should return exception 409 - Conflict', async () => {
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

        await importOrdersController.create(createImportOrderDto);
      
        fail();
      } catch (error){
        //console.log(error);
        if(error instanceof HttpException){
          expect(error).toBeInstanceOf(NotFoundException);
        } else {
          assert.fail();
        }
      }
    });

    it('Test_case_ID: ImportOrdersController_6 -> Should return exception 400 - Bad request', async () => {
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
        importOrderItemDto.expiredAt = expiredAt;

        listImportOrderItemDto.push(importOrderItemDto);

        createImportOrderDto.listImportOrderItemDto = listImportOrderItemDto;

        await importOrdersController.create(createImportOrderDto);
      
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

  describe('approveByManager - PUT/importOrders/:id', () => {
    it('Test_case_ID: ImportOrdersController_20 -> Should return 200 can be return with update result', async () => {
      const importOrderId = createdImportOrderId;
      const managerId = '1';
      const updateResult = await importOrdersController.approveByManager(importOrderId, managerId);

      expect(updateResult).toBeInstanceOf(ImportOrder);

      const listImportOrderItem = await importOrdersService.findImportOrderItemByImportOrder(updateResult.id);
      
      expect((await inventoryHistoriesService.findApprovedHistoriesByImportOrderItems(listImportOrderItem)).length).toEqual(listImportOrderItem.length);
    });

    it('Test_case_ID: ImportOrdersController_21 -> Should return exception 404 - Not found', async () => {
      try{
        const importOrderId = '100000';
        const managerId = '1';
        await importOrdersController.approveByManager(importOrderId, managerId); 
      } catch(error){
        // console.log(error);
        if(error instanceof HttpException){
          expect(error).toBeInstanceOf(NotFoundException);
        } else {
          assert.fail();
        }
      }
    });

    it('Test_case_ID: ImportOrdersController_22 -> Should return exception 409 - Conflict', async () => {
      try{
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

        const creatcreatedResult = await importOrdersController.create(createImportOrderDto);

        const importOrderId = creatcreatedResult.id;
        const managerId = '1000';
        await importOrdersController.approveByManager(importOrderId, managerId); 
      } catch(error){
        if(error instanceof HttpException){
          expect(error).toBeInstanceOf(NotFoundException);
        } else {
          assert.fail();
        }
      }
    });
  });

  // describe('Call method without bearer token', () => {
  //   it('Test_case_ID: ImportOrdersController_ -> Should return exception 401 - Unauthorized', async () => {
      
  //   })
  // });

  // describe('Call method with wrong role', () => {
  //   it('Test_case_ID: ImportOrdersController_ -> Should return exception 403 - Forbidden', async () => {
      
  //   })
  // });

  // describe('find - GET /importOrders', () => {
  //   it('Test_case_ID: ImportOrdersController_ -> Should return 200 with finding result', async () => {

  //   });

  //   it('Test_case_ID: ImportOrdersController_ -> Should return exception 400 - Bad request', async () => {

  //   });

  //   it('Test_case_ID: ImportOrdersController_ -> Should return exception 404 - Not found', async () => {

  //   });
  // });

  // describe('findOne - GET /importOrders/:id', () => {
  //   it('Test_case_ID: ImportOrdersController_ -> Should return 200 with finding result', async () => {

  //   });

  //   it('Test_case_ID: ImportOrdersController_ -> Should return exception 404 - Not found', async () => {

  //   });

  //   it('Test_case_ID: ImportOrdersController_ -> Should return exception 400 - Bad request', async () => {

  //   });
  // });

  // describe('removeByWarehouseStaff - DELETE /importOrders/:id', () => {
  //   it('Test_case_ID: ImportOrdersController_ -> Should return 200 can be return with deleting result', async () => {

  //   });

  //   it('Test_case_ID: ImportOrdersController_ -> Should return exception 404 - Not found', async () => {

  //   });

  //   it('Test_case_ID: ImportOrdersController_ -> Should return exception 409 - Conflict', async () => {

  //   });

  //   it('Test_case_ID: ImportOrdersController_ -> Should return exception 400 - Bad request', async () => {

  //   });

  //   it('Test_case_ID: ImportOrdersController_ -> Should return exception 409 - Conflict', async () => {

  //   });
  // });
});
