import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query, ParseArrayPipe, Inject, ParseIntPipe, BadRequestException, UsePipes, ParseEnumPipe } from '@nestjs/common';
import { ImportOrdersService } from './import-orders.service';
import { CreateImportOrderDto } from './dto/create-import-order.dto';
import { UpdateImportOrderDto } from './dto/update-import-order.dto';
import { ApiHeader, ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiConflictResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Roles } from '../../utilities/custom_decorators/roles.decorator';
import { HttpExceptionDto } from '../../utilities/global_dto/http-exception.dto';
import { UserRole } from '../users/entities/user.entity';
import { ImportOrder, ImportOrderStatus } from './entities/import-order.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { isBigIntInDatabase } from '../../utilities/functions/isBigIntInDatabase';

@ApiHeader({
  name: 'authorization',
  description: 'Bearer token',
})
@ApiBearerAuth()
@Controller('importOrders')
export class ImportOrdersController {
  constructor(
    private readonly importOrdersService: ImportOrdersService,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ){}

  @Post()
  @ApiBody({type: CreateImportOrderDto})
  @ApiCreatedResponse({
    type: ImportOrder
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
  create(@Body() createImportOrderDto: CreateImportOrderDto) {
    return this.importOrdersService.create(createImportOrderDto);
  }

  @Get()
  @ApiOkResponse({
    type: [ImportOrder]
  })
  @ApiQuery({
    required: false,
    name: 'listStatus',
    description: `list of '${ImportOrderStatus.IMPORTING}' or '${ImportOrderStatus.IMPORT_APPROVED}' or '${ImportOrderStatus.MODIFIED}'`
  })
  @ApiQuery({
    required: false,
    name: 'sortBy',
    description: `list of 'id', 'status', 'importDate', 'createdAt', 'updatedAt'`
  })
  @ApiQuery({
    required: false,
    name: 'orders',
    description: `Đi kèm với sortBy, độ dài mảng phải bằng với sortBy`,
  })
  find(
    @Query('listWarehouseId', ParseArrayPipe) listWarehouseId: string[],
    @Query('listStatus', new ParseArrayPipe({
      optional: true,
      //groups: [ImportOrderStatus.IMPORTING, ImportOrderStatus.IMPORT_APPROVED, ImportOrderStatus.MODIFIED], 
    })) listStatus: string[],
    @Query('sortBy', new ParseArrayPipe({
      optional: true,
      //groups: ['id', 'importDate', 'status', 'createdAt', 'updatedAt']
    })) sortBy: string[],
    @Query('orders', new ParseArrayPipe({items: Number, optional: true})) orders: number[],
    @Query('limit', ParseIntPipe) limit: number,
    @Query('offset', ParseIntPipe) offset: number,
  ) {
    const properties = ['id', 'importDate', 'status', 'createdAt', 'updatedAt'];
    if(listStatus != null){
      for(const s of listStatus){
        if(s != ImportOrderStatus.IMPORTING && s != ImportOrderStatus.IMPORT_APPROVED && s != ImportOrderStatus.MODIFIED){
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
    return this.importOrdersService.find(listWarehouseId, listStatus, sortBy, orders, limit, offset);
  }

  @Get(':id')
  @ApiOkResponse({
    type: ImportOrder
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
    if(isBigIntInDatabase(id) == true){
      return this.importOrdersService.findOne(id);
    } else {
      throw new BadRequestException();
    }
  }

  // @Get('test/email')
  // testEmail(){
  //   this.importOrdersService.testEmail();
  // }

  @Patch(':id/byManager/:managerId')
  @Roles([UserRole.MANAGER])
  @ApiOkResponse({
    type: ImportOrder
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
  async approveByManager(@Param('id') id: string, @Param('managerId') managerId: string) {
    const approvedImportOrder = await this.importOrdersService.approveByManager(id, managerId);
    
    await this.cacheManager.clear();

    return approvedImportOrder;
  }

  @Put(':id')
  @ApiOkResponse({
    type: ImportOrder
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
  updateByWarehouseStaff(@Param('id') id: string, @Body() updateImportOrderDto: UpdateImportOrderDto) {
    return this.importOrdersService.updateByWarehouseStaff(id, updateImportOrderDto);
  }

  @Delete(':id')
  @ApiOkResponse({
    type: ImportOrder
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
  removeByWarehouseStaff(@Param('id') id: string, @Query('warehouseStaffId') warehouseStaffId: string) {
    return this.importOrdersService.removeByWarewhouseStaff(id, warehouseStaffId);
  }
}
