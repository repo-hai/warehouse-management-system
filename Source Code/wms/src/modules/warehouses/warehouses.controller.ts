import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, Inject } from '@nestjs/common';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { CreateWarehouseEmployeeDto } from './dto/create-warehouse-employee.dto';
import { CreateWarehouseProductDto } from './dto/create-warehouse-product.dto';
import { UpdateWarehouseProductBatchDto } from './dto/update-warehouse-product-batch.dto';
import { Warehouse } from './entities/warehouse.entity';
import { WarehouseProduct } from './entities/warehouse-product.entity';
import { WarehouseProductBatch } from './entities/warehouse-product-batch.entity';
import { WarehouseEmployee } from './entities/warehouse-employee.entity';
import { DeleteWarehouseEmployeeDto } from './dto/delete-warehouse-employee.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';
import { ApiHeader, ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiNotFoundResponse, ApiConflictResponse } from '@nestjs/swagger';
import { Roles } from '../../utilities/custom_decorators/roles.decorator';
import { HttpExceptionDto } from '../../utilities/global_dto/http-exception.dto';
import { DeleteWarehouseProductDto } from './dto/delete-warehouse-product.dto';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@ApiHeader({
  name: 'authorization',
  description: 'Bearer token',
})
@ApiBearerAuth()
@Controller('warehouses')
export class WarehousesController {
  constructor(
    private readonly warehousesService: WarehousesService,

    private readonly usersService: UsersService,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  @Post()
  @ApiCreatedResponse({
    type: Warehouse
  })
  create(@Body() createWarehouseDto: CreateWarehouseDto) {
    return this.warehousesService.create(createWarehouseDto);
  }

  @Post('products')
  @ApiCreatedResponse({
    type: WarehouseProduct
  })
  async createWarehouseProduct(@Body() createWarehouseProductDto: CreateWarehouseProductDto){
    const createdWarehouseProduct = await this.warehousesService.createWarehouseProduct(createWarehouseProductDto);
    
    await this.cacheManager.clear();

    return createdWarehouseProduct
  }

  @Post('employees')
  @Roles([UserRole.MANAGER])
  @ApiOkResponse({
    type: [WarehouseEmployee]
  })
  createWarehouseEmployee(@Body() createWarehouseEmployeeDto: CreateWarehouseEmployeeDto) {
    return this.warehousesService.createWarehouseEmployee(createWarehouseEmployeeDto);
  }

  @Get()
  @ApiOkResponse({
    type: [Warehouse]
  })
  find(
    @Query('limit', ParseIntPipe) limit: number, 
    @Query('offset', ParseIntPipe) offset: number, 
  ) {
    return this.warehousesService.find(limit, offset);
  }

  @Get(':id')
  @ApiOkResponse({
    type: Warehouse
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
    return this.warehousesService.findOne(id);
  }

  @Get(':warehouseId/users')
  @Roles([UserRole.ADMIN])
  async findEmployeeByAdmin(
    @Param('warehouseId') warehouseId: string
  ){
    return await this.warehousesService.findEmployeeForAdmin(warehouseId);
  }

  @Get(':warehouseId/employees')
  @Roles([UserRole.MANAGER])
  async findEmployeesByManager(
    @Param('warehouseId') warehouseId: string,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('offset', ParseIntPipe) offset: number
  ){
    return await this.usersService.findWarehouseStaffsByWarehouse(warehouseId, limit, offset);
  }

  @Get(':warehouseId/employees/findingByEmployeeName')
  @Roles([UserRole.MANAGER])
  async findEmployeesByNameForManager(
    @Param('warehouseId') warehouseId: string,
    @Query('keyword') keyword: string,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('offset', ParseIntPipe) offset: number
  ){
    return await this.usersService.findWarehouseStaffsByName(warehouseId, keyword, limit, offset);
  }

  @Patch(':id')
  @Roles([UserRole.MANAGER])
  @ApiOkResponse({
    type: Warehouse
  })
  @ApiNotFoundResponse({
    description: 'Not Found Exception',
    type: HttpExceptionDto,
    example: {
      "status": 404,
      "message": "Not Found"
    }
  })
  update(@Param('id') id: string, @Body() updateWarehouseDto: UpdateWarehouseDto) {
    return this.warehousesService.update(id, updateWarehouseDto);
  }

  @Patch('productBatchs/:id/byManager/:managerId')
  @Roles([UserRole.MANAGER])
  @ApiOkResponse({
    type: WarehouseProductBatch
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
  async updateWarehouseProductBatch(
    @Param('id') productBatchId: string,
    @Param('managerId') managerId: string,
    @Body() updateWarehouseProductBatchDto : UpdateWarehouseProductBatchDto
  ){
    const updatedWarehouseProductBatch = await this.warehousesService.updateWarehouseProductBatch(productBatchId, managerId, updateWarehouseProductBatchDto);
    
    await this.cacheManager.clear();

    return updatedWarehouseProductBatch;
  }

  @Delete('products')
  @ApiOkResponse({
    type: WarehouseProduct
  })
  @ApiNotFoundResponse({
    description: 'Not Found Exception',
    type: HttpExceptionDto,
    example: {
      "status": 404,
      "message": "Not Found"
    }
  })
  async deleteWarehouseProduct(@Body() deleteWarehouseProductDto: DeleteWarehouseProductDto) {
    const deletedWarehouseProduct = await this.warehousesService.deleteWarehouseProduct(deleteWarehouseProductDto);
  
    await this.cacheManager.clear();

    return deletedWarehouseProduct;
  }

  @Delete('employees')
  @Roles([UserRole.MANAGER])
  @ApiOkResponse({
    type: WarehouseEmployee
  })
  @ApiNotFoundResponse({
    description: 'Not Found Exception',
    type: HttpExceptionDto,
    example: {
      "status": 404,
      "message": "Not Found"
    }
  })
  deleteWarehouseEmployee(@Body() deleteWarehouseEmployeeDto: DeleteWarehouseEmployeeDto) {
    return this.warehousesService.deleteWarehouseEmployee(deleteWarehouseEmployeeDto);
  }
}
