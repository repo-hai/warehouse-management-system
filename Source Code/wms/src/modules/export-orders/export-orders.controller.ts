import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put, ParseArrayPipe, ParseIntPipe, Inject, BadRequestException } from '@nestjs/common';
import { ExportOrdersService } from './export-orders.service';
import { CreateExportOrderDto } from './dto/create-export-order.dto';
import { UpdateExportOrderDto } from './dto/update-export-order.dto';
import { UpdateExportOrderByManagerDto } from './dto/update-export-order-by-manager.dto';
import { ApiHeader, ApiBearerAuth, ApiCreatedResponse, ApiNotFoundResponse, ApiConflictResponse, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { Roles } from '../../utilities/custom_decorators/roles.decorator';
import { HttpExceptionDto } from '../../utilities/global_dto/http-exception.dto';
import { UserRole } from '../users/entities/user.entity';
import { ExportOrder, ExportOrderStatus } from './entities/export-order.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@ApiHeader({
  name: 'authorization',
  description: 'Bearer token',
})
@ApiBearerAuth()
@Controller('export-orders')
export class ExportOrdersController {
  constructor(
    private readonly exportOrdersService: ExportOrdersService,
    
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  @Post()
  @ApiCreatedResponse({
    type: ExportOrder
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
  async create(@Body() createExportOrderDto: CreateExportOrderDto) {
    const createdExportOrder = await this.exportOrdersService.create(createExportOrderDto);

    await this.cacheManager.clear();

    return createdExportOrder;
  }

  @Get()
  @ApiOkResponse({
    type: [ExportOrder]
  })
  @ApiQuery({
    required: false,
    name: 'listStatus',
    description: `list of '${ExportOrderStatus.APPROVED_EXPORT}' or '${ExportOrderStatus.EXPORTING}' or '${ExportOrderStatus.MODIFIED}'`
  })
  @ApiQuery({
    required: false,
    name: 'sortBy',
    description: `list of 'product_id', 'product_name', 'last_stock', 'updated_stock', 'created_at', 
                  'updated_at', 'staff_id', 'staff_name', 'manager_id', 'manager_name', 'variation'`
  })
  @ApiQuery({
    required: false,
    name: 'orders',
    description: `Đi kèm với sortBy, độ dài mảng phải bằng với sortBy`
  })
  find(
    @Query('listWarehouseId', ParseArrayPipe) listWarehouseId: string[],
    @Query('listStatus', new ParseArrayPipe({optional: true})) listStatus: string[],
    @Query('sortBy', new ParseArrayPipe({optional: true})) sortBy: string[],
    @Query('orders', new ParseArrayPipe({items: Number, optional: true})) orders: number[],
    @Query('limit', ParseIntPipe) limit: number,
    @Query('offset', ParseIntPipe) offset: number,
  ) {
    const properties = [
      'product_id', 'product_name', 'last_stock', 'updated_stock', 'created_at', 'updated_at',
      'staff_id', 'staff_name', 'manager_id', 'manager_name', 'variation'
    ];
    if(listStatus != null){
      for(const s of listStatus){
        if(s != ExportOrderStatus.APPROVED_EXPORT && s != ExportOrderStatus.EXPORTING && s != ExportOrderStatus.MODIFIED){
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
    return this.exportOrdersService.find(listWarehouseId, listStatus, sortBy, orders, limit, offset);
  }

  @Get(':id')
  @ApiOkResponse({
    type: ExportOrder
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
    return this.exportOrdersService.findOne(id);
  }

  // @Get('warehouses/:id/unapproved')
  // @ApiNotFoundResponse({
  //   description: 'Not Found Exception',
  //   type: HttpExceptionDto,
  //   example: {
  //     "status": 404,
  //     "message": "Not Found"
  //   }
  // })
  // findUnapprovedExportOrders(
  //   @Param('id') id: string,
  //   @Query('limit', ParseIntPipe) limit: number,
  //   @Query('offset', ParseIntPipe) offset: number,
  // ){
  //   return this.exportOrdersService.findUnapprovedExportOrders(limit, offset, id);
  // }

  @Put(':id')
  @ApiOkResponse({
    type: ExportOrder
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
  async updateByWarehouseStaff(@Param('id') id: string, @Body() updateExportOrderDto: UpdateExportOrderDto) {
    const updatedExportOrder = await this.exportOrdersService.updateByWarehouseStaff(id, updateExportOrderDto);
    await this.cacheManager.clear();

    return updatedExportOrder;
  }

  @Patch(':id/byManager/:managerId')
  @Roles([UserRole.MANAGER])
  @ApiOkResponse({
    type: ExportOrder
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
  approveByManager(
    @Param('managerId') managerId: string,
    @Body() updateExportOrderByManagerDto: UpdateExportOrderByManagerDto
  ){
    return this.exportOrdersService.approveByManager(managerId, updateExportOrderByManagerDto);
  }

  @Delete(':id')
  @ApiOkResponse({
    type: ExportOrder
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
  async removeByWarehouseStaff(
    @Param('id') id: string,
    @Query('warehouseStaffId') warehouseStaffId: string
  ){
    const deletedExportOrder = await this.exportOrdersService.removeByWarehouseStaff(id, warehouseStaffId);
    await this.cacheManager.clear();

    return deletedExportOrder;
  }

  @Delete(':id/byManager/:managerId')
  @Roles([UserRole.MANAGER])
  @ApiOkResponse({
    type: ExportOrder
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
  async removeByManager(
    @Param('id') id: string, 
    @Param('managerId') managerId: string
  ) {
    const deletedExportOrder = await this.exportOrdersService.removeByManager(id, managerId);
    await this.cacheManager.clear();

    return deletedExportOrder;
  }
}
