import { Controller, Get, Post, Body, Patch, Param, Query, ParseIntPipe } from '@nestjs/common';
import { suppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Supplier } from './entities/supplier.entity';
import { UserRole } from '../users/entities/user.entity';
import { ApiHeader, ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { Roles } from '../../utilities/custom_decorators/roles.decorator';
import { HttpExceptionDto } from '../../utilities/global_dto/http-exception.dto';

@ApiHeader({
  name: 'authorization',
  description: 'Bearer token',
})
@ApiBearerAuth()
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: suppliersService) {}

  @Post()
  @ApiCreatedResponse({
    type: Supplier
  })
  @Roles([UserRole.MANAGER])
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.suppliersService.create(createSupplierDto);
  }

  @Get()
  @ApiOkResponse({
    type: [Supplier]
  })
  find(
    @Query('limit', ParseIntPipe) limit: number,
    @Query('offset', ParseIntPipe) offset: number,
  ){
    return this.suppliersService.find(limit, offset);
  }

  @Get(':id')
  @ApiOkResponse({
    type: Supplier
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
    return this.suppliersService.findOne(id);
  }

  @Get('options/recentlyImported')
  @ApiOkResponse({
    type: [Supplier]
  })
  findRecentlyImportedSuppliers(
    @Query('warehouseId') warehouseId: string,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('offset', ParseIntPipe) offset: number,
  ){
    return this.suppliersService.findRecentlyImportedSuppliers(warehouseId, limit, offset);
  }

  @Get('options/findingBySupplierName')
  @ApiOkResponse({
    type: [Supplier]
  })
  findBySupplierName(
    @Query('keyword') keyword: string,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('offset', ParseIntPipe) offset: number,
  ){
    return this.suppliersService.findBySupplierName(keyword, limit, offset);
  }

  @Patch(':id')
  @Roles([UserRole.MANAGER])
  @ApiOkResponse({
    type: Supplier
  })
  @ApiNotFoundResponse({
    description: 'Not Found Exception',
    type: HttpExceptionDto,
    example: {
      "status": 404,
      "message": "Not Found"
    }
  })
  update(@Param('id') id: string, @Body() updateSupplierDto: UpdateSupplierDto) {
    return this.suppliersService.update(id, updateSupplierDto);
  }
}
