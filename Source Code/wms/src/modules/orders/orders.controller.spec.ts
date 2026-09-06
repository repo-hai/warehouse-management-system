import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentsModule } from '../agents/agents.module';
import { ExportOrdersModule } from '../export-orders/export-orders.module';
import { ProductsModule } from '../products/products.module';
import { WarehousesModule } from '../warehouses/warehouses.module';
import { OrderProduct } from './entities/order-product.entity';
import { Order } from './entities/order.entity';
import { ROOT_SETTING, TIMEOUT } from '../../utilities/constants/constants';

describe('OrdersController', () => {
  let ordersController: OrdersController;

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
      controllers: [OrdersController],
      providers: [OrdersService],
    }).compile();

    ordersController = testingModule.get<OrdersController>(OrdersController);
  }, TIMEOUT.TEST_TIMEOUT);

  it('should be defined', () => {
    expect(ordersController).toBeDefined();
  });

  // describe('Call method without bearer token', () => {
  //   it('Test_case_ID: OrdersController_ -> Should return exception 401 - Unauthorized', async () => {
      
  //   })
  // });

  // describe('Call method with wrong role', () => {
  //   it('Test_case_ID: OrdersController_ -> Should return exception 403 - Forbidden', async () => {
      
  //   })
  // });

  // describe('create - POST /orders', () => {
  //   it('Test_case_ID: OrdersController_ -> Should return 201 - Created', async () => {
      
  //   });

  //   it('Test_case_ID: OrdersController_ -> Should return exception 409 - Conflict', async () => {
      
  //   });

  //   it('Test_case_ID: OrdersController_ -> Should return exception 409 - Conflict', async () => {
      
  //   });

  //   it('Test_case_ID: OrdersController_ -> Should return exception 400 - Bad request', async () => {
      
  //   });

  //   it('Test_case_ID: OrdersController_ -> Should return exception 400 - Bad request', async () => {
      
  //   });
  // });

  // describe('find - GET /orders', () => {
  //   it('Test_case_ID: OrdersController_ -> Should return 200 with finding data', async () => {
      
  //   });

  //   it('Test_case_ID: OrdersController_ -> Should return exception 400 - Bad request', async () => {
      
  //   });

  //   it('Test_case_ID: OrdersController_ -> Should return exception 404 - Not found', async () => {
      
  //   });
  // });

  // describe('findOne - GET /orders/:id', () => {
  //   it('Test_case_ID: OrdersController_ -> Should return 200 with only one finding data', async () => {
      
  //   });

  //   it('Test_case_ID: OrdersController_ -> Should return exception 404 - Not found', async () => {
      
  //   });
    
  //   it('Test_case_ID: OrdersController_ -> Should return exception 400 - Bad request', async () => {
      
  //   });
  // });
  
  // describe('findRemainingOrderProductsInOrder - GET /orders/:orderId/remaining', () => {
  //   it('Test_case_ID: OrdersController_ -> Should return 200 with only one finding data', async () => {
      
  //   });

  //   it('Test_case_ID: OrdersController_ -> Should return exception 404 - Not found', async () => {
      
  //   });
    
  //   it('Test_case_ID: OrdersController_ -> Should return exception 400 - Bad request', async () => {
      
  //   });
  // });

  // describe('update - PATCH /orders/:id', () => {
  //   it('Test_case_ID: OrdersController_ -> Should return 200, could be return with update result', async () => {
      
  //   });

  //   it('Test_case_ID: OrdersController_ -> Should return 200, could be return with update result', async () => {
      
  //   });

  //   it('Test_case_ID: OrdersController_ -> Should return exception 404 - Not found', async () => {
      
  //   });
    
  //   it('Test_case_ID: OrdersController_ -> Should return exception 400 - Bad request', async () => {
      
  //   });

  //   it('Test_case_ID: OrdersController_ -> Should return exception 409 - Conflict', async () => {
      
  //   });
  // });

  // describe('remove - DELETE /orders/:id', () => {
  //   it('Test_case_ID: OrdersController_ -> Should return 200, could be return with delete result', async () => {
      
  //   });

  //   it('Test_case_ID: OrdersController_ -> Should return exception 404 - Not found', async () => {
      
  //   });

  //   it('Test_case_ID: OrdersController_ -> Should return exception 409 - Conflict', async () => {
      
  //   });

  //   it('Test_case_ID: OrdersController_ -> Should return exception 409 - Conflict', async () => {
      
  //   });

  //   it('Test_case_ID: OrdersController_ -> Should return exception 400 - Bad request', async () => {
      
  //   });

  //   it('Test_case_ID: OrdersController_ -> Should return exception 409 - Conflict', async () => {
      
  //   });
  // });
});
