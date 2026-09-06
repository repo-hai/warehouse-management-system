import { Controller, Get, Param } from '@nestjs/common';
import { InventoryHistoriesService } from './inventory-histories.service';
import { UserRole } from '../users/entities/user.entity';
import { ApiHeader, ApiBearerAuth, ApiNotFoundResponse } from '@nestjs/swagger';
import { Roles } from '../../utilities/custom_decorators/roles.decorator';
import { HttpExceptionDto } from '../../utilities/global_dto/http-exception.dto';

@ApiHeader({
  name: 'authorization',
  description: 'Bearer token',
})
@ApiBearerAuth()
@Controller('inventory-histories')
export class InventoryHistoriesController {
  constructor(private readonly inventoryHistoriesService: InventoryHistoriesService) {}

  @Get(':id')
  @Roles([UserRole.MANAGER])
  @ApiNotFoundResponse({
    description: 'Not Found Exception',
    type: HttpExceptionDto,
    example: {
      "status": 404,
      "message": "Not Found"
    }
  })
  findOne(@Param('id') id: string) {
    return this.inventoryHistoriesService.findOne(id);
  }
}
