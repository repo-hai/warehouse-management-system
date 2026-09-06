import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Inject, ParseArrayPipe, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, OrderStatus } from './entities/order.entity';
import { GetRemainingInAnOrder } from './dto/get-remaining-in-an-order.dto';
import { ApiHeader, ApiBearerAuth, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiConflictResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { HttpExceptionDto } from '../../utilities/global_dto/http-exception.dto';

@ApiHeader({
  name: 'authorization',
  description: 'Bearer token',
})
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
  ) {}

  @Post()
  @ApiCreatedResponse({
    type: Order
  })
  @ApiNotFoundResponse({
    description: 'Not Found Exception',
    type: HttpExceptionDto,
    example: {
      "status": 404,
      "message": "Not Found"
    }
  })
  @ApiConflictResponse({
    description: 'Conflict Exception',
    type: HttpExceptionDto,
    example: {
      "status": 409,
      "message": "Conflict"
    }
  })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @ApiOkResponse({
    type: [Order]
  })
  @ApiQuery({
    required: false,
    name: 'listStatus',
    description: `list of '${OrderStatus.COMPLETED}' or '${OrderStatus.PROCESSING}'`
  })
  @ApiQuery({
    required: false,
    name: 'sortBy',
    description: `list of 'id', 'deadline', 'deliveryTo', 'receiverPhoneNumber', 'status', 'createdAt', 'updatedAt'`
  })
  @ApiQuery({
    required: false,
    name: 'orders',
    description: `Đi kèm với sortBy, độ dài mảng phải bằng với sortBy`
  })
  find(
    @Query('listWarehouseId', ParseArrayPipe) listWarehouseId: string[],
    @Query('listStatus', new ParseArrayPipe({
      optional: true,
      //groups: [OrderStatus.COMPLETED, OrderStatus.PROCESSING]
    })) listStatus: string[],
    @Query('sortBy', new ParseArrayPipe({
      optional: true,
      //groups: ['id', 'deadline', 'deliveryTo', 'receiverPhoneNumber', 'status', 'createdAt', 'updatedAt']
    })) sortBy: string[],
    @Query('orders', new ParseArrayPipe({items: Number, optional: true})) orders: number[],
    @Query('limit', ParseIntPipe) limit: number,
    @Query('offset', ParseIntPipe) offset: number,
  ) {
    const properties = ['id', 'deadline', 'deliveryTo', 'receiverPhoneNumber', 'status', 'createdAt', 'updatedAt'];
    if(listStatus != null){
      for(const s of listStatus){
        if(s != OrderStatus.COMPLETED && s != OrderStatus.PROCESSING){
          throw new BadRequestException("Validation fail in list status");
        }
      }
    }
    if(sortBy != null){
      for(const s of sortBy){
        if(properties.includes(s) == false){
          throw new BadRequestException("Validation fail in sort by");
        }
      }
    }
    return this.ordersService.find(listWarehouseId, listStatus, sortBy, orders, limit, offset);
  }

  @Get(':id')
  @ApiOkResponse({
    type: Order
  })
  @ApiNotFoundResponse({
    description: 'Not Found Exception',
    type: HttpExceptionDto,
    example: {
      "status": 404,
      "message": "Not Found"
    }
  })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Get(':orderId/remaining')
  @ApiOkResponse({
    type: GetRemainingInAnOrder
  })
  findRemainingOrderProductsInOrder(@Param('orderId') orderId: string) {
    return this.ordersService.findRemainingInAnOrder(orderId);
  }

  @Patch(':id')
  @ApiOkResponse({
    type: Order
  })
  @ApiNotFoundResponse({
    description: 'Not Found Exception',
    type: HttpExceptionDto,
    example: {
      "status": 404,
      "message": "Not Found"
    }
  })
  @ApiConflictResponse({
    description: 'Conflict Exception',
    type: HttpExceptionDto,
    example: {
      "status": 409,
      "message": "Conflict"
    }
  })
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @ApiOkResponse({
    type: Order
  })
  @ApiNotFoundResponse({
    description: 'Not Found Exception',
    type: HttpExceptionDto,
    example: {
      "status": 404,
      "message": "Not Found"
    }
  })
  @ApiConflictResponse({
      description: 'Conflict Exception',
      type: HttpExceptionDto,
      example: {
        "status": 409,
        "message": "Conflict"
      }
    })
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
