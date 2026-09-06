import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { OrderProduct } from './entities/order-product.entity';
import { forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentsModule } from '../agents/agents.module';
import { ExportOrdersModule } from '../export-orders/export-orders.module';
import { ProductsModule } from '../products/products.module';
import { WarehousesModule } from '../warehouses/warehouses.module';
import { ROOT_SETTING, TIMEOUT } from '../../utilities/constants/constants';

describe('ordersService', () => {
  let ordersService: OrdersService;

  beforeAll(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      imports: [
        ...ROOT_SETTING,
        TypeOrmModule.forFeature([Order, OrderProduct]),
        ProductsModule,
        ExportOrdersModule,
        forwardRef(() => AgentsModule),
        forwardRef(() => WarehousesModule)
      ],
      providers: [OrdersService],
    }).compile();

    ordersService = testingModule.get<OrdersService>(OrdersService);
  }, TIMEOUT.TEST_TIMEOUT);

  it('should be defined', () => {
    expect(ordersService).toBeDefined();
  });

  // describe('create', () => {
  //   it('Test_case_ID: OrdersService_ -> Should return created object', async () => {

  //   });

  //   it('Test_case_ID: OrdersService_ -> Should return 409 - Conflict', async () => {

  //   });

  //   it('Test_case_ID: OrdersService_ -> Should return 409 - Conflict', async () => {
      
  //   });

  //   it('Test_case_ID: OrdersService_ -> Should return 400 - Bad request', async () => {
      
  //   });

  //   it('Test_case_ID: OrdersService_ -> Should return 400 - Bad request', async () => {
      
  //   });
  // });

  // describe('find', () => {
  //   it('Test_case_ID: OrdersService_ -> Should return with finding data', async () => {
      
  //   });

  //   it('Test_case_ID: OrdersService_ -> Should return 400 - Bad request', async () => {
      
  //   });

  //   it('Test_case_ID: OrdersService_ -> Should return 404 - Not found', async () => {
      
  //   });
  // });

  // describe('findOne', () => {
  //   it('Test_case_ID: OrdersService_ -> Should return with only one finding data', async () => {
      
  //   });

  //   it('Test_case_ID: OrdersService_ -> Should return 404 - Not found', async () => {
  //     const id = '1'
  //     const order = ordersService.findOne(id);

  //     expect(order).toBeInstanceOf(Order);
  //   });
    
  //   it('Test_case_ID: OrdersService_ -> Should return 400 - Bad request', async () => {
      
  //   });
  // });
  
  // describe('findRemainingOrderProductsInOrder', () => {
  //   it('Test_case_ID: OrdersService_ -> Should return with only one finding data', async () => {
      
  //   });

  //   it('Test_case_ID: OrdersService_ -> Should return 404 - Not found', async () => {
      
  //   });
    
  //   it('Test_case_ID: OrdersService_ -> Should return 400 - Bad request', async () => {
      
  //   });
  // });

  // describe('update', () => {
  //   it('Test_case_ID: OrdersService_ -> Could be return with update result', async () => {
      
  //   });

  //   it('Test_case_ID: OrdersService_ -> Could be return with update result', async () => {
      
  //   });

  //   it('Test_case_ID: OrdersService_ -> Should return 404 - Not found', async () => {
      
  //   });
    
  //   it('Test_case_ID: OrdersService_ -> Should return 400 - Bad request', async () => {
      
  //   });

  //   it('Test_case_ID: OrdersService_ -> Should return 409 - Conflict', async () => {
      
  //   });
  // });

  // describe('remove', () => {
  //   it('Test_case_ID: OrdersService_ -> Could be return with delete result', async () => {
      
  //   });

  //   it('Test_case_ID: OrdersService_ -> Should return 404 - Not found', async () => {
      
  //   });

  //   it('Test_case_ID: OrdersService_ -> Should return 409 - Conflict', async () => {
      
  //   });

  //   it('Test_case_ID: OrdersService_ -> Should return 409 - Conflict', async () => {
      
  //   });

  //   it('Test_case_ID: OrdersService_ -> Should return 400 - Bad request', async () => {
      
  //   });

  //   it('Test_case_ID: OrdersService_ -> Should return 409 - Conflict', async () => {
      
  //   });
  // });
});
