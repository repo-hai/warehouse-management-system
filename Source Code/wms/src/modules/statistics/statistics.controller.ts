import { BadRequestException, Controller, Get, ParseArrayPipe, ParseBoolPipe, ParseDatePipe, Query} from '@nestjs/common';
import { statisticsService } from './statistics.service';
import { ApiHeader, ApiBearerAuth, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { Roles } from '../../utilities/custom_decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { AgentStatisticDto } from './dto/agent-statistic.dto';
import { InventoryVariationDto } from './dto/inventory-variation-statistic.dto';
import { MonthlyExportReportDto } from './dto/monthly-export-report.dto';
import { MonthlyImportReportDto } from './dto/monthly-import-report.dto.';
import { ProductStatisticDto } from './dto/product-statistic.dto';
import { StatisticDto } from './dto/statistic.dto';
import { StockStatisticDto } from './dto/stock-statistic.dto';
import { SupplierStatisticDto } from './dto/supplier-statistic.dto';

@ApiHeader({
  name: 'authorization',
  description: 'Bearer token',
})
@ApiBearerAuth()
@Controller('statistics')
export class StatisticsController {
  constructor(
    private readonly statisticsService: statisticsService
  ){}

  @Get('bestSeller')
  @Roles([UserRole.MANAGER])
  @ApiOkResponse({
    type: ProductStatisticDto
  })
  @ApiQuery({
    required: false,
    name: 'listWarehouseId',
  })
  @ApiQuery({
    required: false,
    name: 'orderBy',
    description: `list of 'product_id', 'product_name', 'total_sold_quantity'`
  })
  @ApiQuery({
    required: false,
    name: 'sorts',
    description: `Đi kèm với sortBy, độ dài mảng phải bằng với sortBy`
  })
  getBestSellerStatistic(
    @Query('startDate', new ParseDatePipe()) startDate: Date,
    @Query('endDate', new ParseDatePipe()) endDate: Date,
    @Query('getByEntireSystem', ParseBoolPipe) getByEntireSystem: boolean,
    @Query('listWarehouseId', new ParseArrayPipe({optional: true})) listWarehouseId: string[],
    @Query('orderBy', new ParseArrayPipe({optional: true})) orderBy: string[],
    @Query('sorts', new ParseArrayPipe({items: Number, optional: true})) sorts: number[],
  ){
    const properties = ['product_id', 'product_name', 'total_sold_quantity'];
    if(orderBy != null){
      if(sorts.length != orderBy.length){
        throw new BadRequestException("sorts.length != orderBy.length");
      }
      for(const s of orderBy){
        if(properties.includes(s) == false){
          throw new BadRequestException("Validation fail in order by");   
        }
      }
    }

    if(getByEntireSystem == false && listWarehouseId == null){
      throw new BadRequestException("Không có danh sách warehouseId");
    }

    const statisticDto = new StatisticDto();
    statisticDto.startDate = startDate;
    statisticDto.endDate = endDate;
    statisticDto.getByEntireSystem = getByEntireSystem;
    statisticDto.listWarehouseId = listWarehouseId;
    statisticDto.orderBy = orderBy;
    statisticDto.sorts = sorts;
    
    return this.statisticsService.getBestSellerStatistic(statisticDto);
  }

  @Get('expiringProductBatch')
  @Roles([UserRole.MANAGER])
  @ApiOkResponse({
    type: ProductStatisticDto
  })
  @ApiQuery({
    required: false,
    name: 'listWarehouseId',
  })
  @ApiQuery({
    required: false,
    name: 'orderBy',
    description: `list of 'product_id', 'product_name', 'total_stock'`
  })
  @ApiQuery({
    required: false,
    name: 'sorts',
    description: `Đi kèm với sortBy, độ dài mảng phải bằng với sortBy`
  })
  getExpiringProductBatchStatistic(
    @Query('endDate', new ParseDatePipe()) endDate: Date,
    @Query('getByEntireSystem', ParseBoolPipe) getByEntireSystem: boolean,
    @Query('listWarehouseId', new ParseArrayPipe({optional: true})) listWarehouseId: string[],
    @Query('orderBy', new ParseArrayPipe({optional: true})) orderBy: string[],
    @Query('sorts', new ParseArrayPipe({items: Number, optional: true})) sorts: number[],
  ){
    const properties = ['product_id', 'product_name', 'total_stock'];
    if(orderBy != null){
      if(sorts.length != orderBy.length){
        throw new BadRequestException("sorts.length != orderBy.length");
      }
      for(const s of orderBy){
        if(properties.includes(s) == false){
          throw new BadRequestException("Validation fail in order by");   
        }
      }
    }

    if(getByEntireSystem == false && listWarehouseId == null){
      throw new BadRequestException("Không có danh sách warehouseId");
    }

    const statisticDto = new StatisticDto();
    statisticDto.endDate = endDate;
    statisticDto.getByEntireSystem = getByEntireSystem;
    statisticDto.listWarehouseId = listWarehouseId;
    statisticDto.orderBy = orderBy;
    statisticDto.sorts = sorts;

    return this.statisticsService.getExpiringProductBatchStatistic(statisticDto);
  }

  @Get('productStock')
  @Roles([UserRole.MANAGER])
  @ApiOkResponse({
    type: StockStatisticDto
  })
  @ApiQuery({
    required: false,
    name: 'listWarehouseId',
  })
  @ApiQuery({
    required: false,
    name: 'orderBy',
    description: `list of 'product_id', 'product_name', 'total_stock'`
  })
  @ApiQuery({
    required: false,
    name: 'sorts',
    description: `Đi kèm với sortBy, độ dài mảng phải bằng với sortBy`
  })
  getProductStockStatistic(
    @Query('getByEntireSystem', ParseBoolPipe) getByEntireSystem: boolean,
    @Query('listWarehouseId', new ParseArrayPipe({optional: true})) listWarehouseId: string[],
    @Query('orderBy', new ParseArrayPipe({optional: true})) orderBy: string[],
    @Query('sorts', new ParseArrayPipe({items: Number, optional: true})) sorts: number[],
  ){
    const properties = ['product_id', 'product_name', 'total_stock'];
    if(orderBy != null){
      if(sorts.length != orderBy.length){
        throw new BadRequestException("sorts.length != orderBy.length");
      }
      
      for(const s of orderBy){
        if(properties.includes(s) == false){
          throw new BadRequestException("Validation fail in order by");   
        }
      }
    }

    if(getByEntireSystem == false && listWarehouseId == null){
      throw new BadRequestException("Không có danh sách warehouseId");
    }

    const statisticDto = new StatisticDto();
    statisticDto.getByEntireSystem = getByEntireSystem;
    statisticDto.listWarehouseId = listWarehouseId;
    statisticDto.orderBy = orderBy;
    statisticDto.sorts = sorts;

    return this.statisticsService.getProductStockStatistic(statisticDto);
  }

  @Get('inventoryHistory')
  @Roles([UserRole.MANAGER])
  @ApiOkResponse({
    type: InventoryVariationDto
  })
  @ApiQuery({
    required: false,
    name: 'listProductId',
  })
  @ApiQuery({
    required: false,
    name: 'listWarehouseId',
  })
  @ApiQuery({
    required: false,
    name: 'orderBy',
    description: `list of 'product_id', 'product_name', 'total_stock'`
  })
  @ApiQuery({
    required: false,
    name: 'sorts',
    description: `Đi kèm với sortBy, độ dài mảng phải bằng với sortBy`
  })
  getInventoryHistoryVariation(
    @Query('startDate', new ParseDatePipe()) startDate: Date,
    @Query('endDate', new ParseDatePipe()) endDate: Date,
    @Query('getByEntireSystem', ParseBoolPipe) getByEntireSystem: boolean,
    @Query('listWarehouseId', new ParseArrayPipe({optional: true})) listWarehouseId: string[],
    @Query('orderBy', new ParseArrayPipe({optional: true})) orderBy: string[],
    @Query('sorts', new ParseArrayPipe({items: Number, optional: true})) sorts: number[],
    @Query('listProductId', new ParseArrayPipe({optional: true})) listProductId: string[],
  ){
    const properties = ['product_id', 'product_name', 'total_stock'];
    if(orderBy != null){
      if(sorts.length != orderBy.length){
        throw new BadRequestException("sorts.length != orderBy.length");
      }
      
      for(const s of orderBy){
        if(properties.includes(s) == false){
          throw new BadRequestException("Validation fail in order by");   
        }
      }
    }

    if(getByEntireSystem == false && listWarehouseId == null){
      throw new BadRequestException("Không có danh sách warehouseId");
    }

    const statisticDto = new StatisticDto();
    statisticDto.startDate = startDate;
    statisticDto.endDate = endDate;
    statisticDto.getByEntireSystem = getByEntireSystem;
    statisticDto.listWarehouseId = listWarehouseId;
    statisticDto.orderBy = orderBy;
    statisticDto.sorts = sorts;
    statisticDto.listProductId = listProductId;

    return this.statisticsService.getInventoryHistoryVariation(statisticDto);
  }

  @Get('agent')
  @Roles([UserRole.MANAGER])
  @ApiOkResponse({
    type: AgentStatisticDto
  })
  @ApiQuery({
    required: false,
    name: 'listWarehouseId',
  })
  @ApiQuery({
    required: false,
    name: 'orderBy',
    description: `list of 'agent_id', 'agent_name', 'number_of_export_order', 'total_quantity'`
  })
  @ApiQuery({
    required: false,
    name: 'sorts',
    description: `Đi kèm với sortBy, độ dài mảng phải bằng với sortBy`
  })
  getAgentStatistic(
    @Query('startDate', new ParseDatePipe()) startDate: Date,
    @Query('endDate', new ParseDatePipe()) endDate: Date,
    @Query('getByEntireSystem', ParseBoolPipe) getByEntireSystem: boolean,
    @Query('listWarehouseId', new ParseArrayPipe({optional: true})) listWarehouseId: string[],
    @Query('orderBy', new ParseArrayPipe({optional: true})) orderBy: string[],
    @Query('sorts', new ParseArrayPipe({items: Number, optional: true})) sorts: number[],
  ){
    const properties = ['agent_id', 'agent_name', 'number_of_export_order', 'total_quantity'];
    if(orderBy != null){
      if(sorts.length != orderBy.length){
        throw new BadRequestException("sorts.length != orderBy.length");
      }
      
      for(const s of orderBy){
        if(properties.includes(s) == false){
          throw new BadRequestException("Validation fail in order by");   
        }
      }
    }

    if(getByEntireSystem == false && listWarehouseId == null){
      throw new BadRequestException("Không có danh sách warehouseId");
    }

    const statisticDto = new StatisticDto();
    statisticDto.startDate = startDate;
    statisticDto.endDate = endDate;
    statisticDto.getByEntireSystem = getByEntireSystem;
    statisticDto.listWarehouseId = listWarehouseId;
    statisticDto.orderBy = orderBy;
    statisticDto.sorts = sorts;

    return this.statisticsService.getAgentStatistic(statisticDto);
  }

  @Get('supplier')
  @Roles([UserRole.MANAGER])
  @ApiOkResponse({
    type: SupplierStatisticDto
  })
  @ApiQuery({
    required: false,
    name: 'listWarehouseId',
  })
  @ApiQuery({
    required: false,
    name: 'orderBy',
    description: `list of 'supplier_id', 'supplier_name', 'number_of_import_order', 'total_quantity'`
  })
  @ApiQuery({
    required: false,
    name: 'sorts',
    description: `Đi kèm với sortBy, độ dài mảng phải bằng với sortBy`
  })
  getSupplierStatistic(
    @Query('startDate', new ParseDatePipe()) startDate: Date,
    @Query('endDate', new ParseDatePipe()) endDate: Date,
    @Query('getByEntireSystem', ParseBoolPipe) getByEntireSystem: boolean,
    @Query('listWarehouseId', new ParseArrayPipe({optional: true})) listWarehouseId: string[],
    @Query('orderBy', new ParseArrayPipe({optional: true})) orderBy: string[],
    @Query('sorts', new ParseArrayPipe({items: Number, optional: true})) sorts: number[],
  ){
    const properties = ['supplier_id', 'supplier_name', 'number_of_import_order', 'total_quantity'];
    if(orderBy != null){
      if(sorts.length != orderBy.length){
        throw new BadRequestException("sorts.length != orderBy.length");
      }
      
      for(const s of orderBy){
        if(properties.includes(s) == false){
          throw new BadRequestException("Validation fail in order by");   
        }
      }
    }

    if(getByEntireSystem == false && listWarehouseId == null){
      throw new BadRequestException("Không có danh sách warehouseId");
    }

    const statisticDto = new StatisticDto();
    statisticDto.startDate = startDate;
    statisticDto.endDate = endDate;
    statisticDto.getByEntireSystem = getByEntireSystem;
    statisticDto.listWarehouseId = listWarehouseId;
    statisticDto.orderBy = orderBy;
    statisticDto.sorts = sorts;

    return this.statisticsService.getSupplierStatistic(statisticDto);
  }

  @Get('montlyImportReport')
  @Roles([UserRole.MANAGER])
  @ApiOkResponse({
    type: MonthlyImportReportDto
  })
  @ApiQuery({
    required: false,
    name: 'listWarehouseId',
  })
  @ApiQuery({
    required: false,
    name: 'orderBy',
    description: `list of 'day', 'total_quantity', 'number_of_import_order'`
  })
  @ApiQuery({
    required: false,
    name: 'sorts',
    description: `Đi kèm với sortBy, độ dài mảng phải bằng với sortBy`
  })
  getMontlyImportReport(
    @Query('month', new ParseDatePipe()) month: Date,
    @Query('getByEntireSystem', ParseBoolPipe) getByEntireSystem: boolean,
    @Query('listWarehouseId', new ParseArrayPipe({optional: true})) listWarehouseId: string[],
    @Query('orderBy', new ParseArrayPipe({optional: true})) orderBy: string[],
    @Query('sorts', new ParseArrayPipe({items: Number, optional: true})) sorts: number[],
  ){
    const properties = ['day', 'total_quantity', 'number_of_import_order'];
    if(orderBy != null){
      if(sorts.length != orderBy.length){
        throw new BadRequestException("sorts.length != orderBy.length");
      }
      
      for(const s of orderBy){
        if(properties.includes(s) == false){
          throw new BadRequestException("Validation fail in order by");   
        }
      }
    }

    if(getByEntireSystem == false && listWarehouseId == null){
      throw new BadRequestException("Không có danh sách warehouseId");
    }

    const statisticDto = new StatisticDto();
    statisticDto.month = month;
    statisticDto.getByEntireSystem = getByEntireSystem;
    statisticDto.listWarehouseId = listWarehouseId;
    statisticDto.orderBy = orderBy;
    statisticDto.sorts = sorts;

    return this.statisticsService.getMontlyImportReport(statisticDto);
  }

  @Get('monthlyExportReport')
  @Roles([UserRole.MANAGER])
  @ApiOkResponse({
    type: MonthlyExportReportDto
  })
  @ApiQuery({
    required: false,
    name: 'listWarehouseId',
  })
  @ApiQuery({
    required: false,
    name: 'orderBy',
    description: `list of 'day', 'total_quantity', 'number_of_export_order'`
  })
  @ApiQuery({
    required: false,
    name: 'sorts',
    description: `Đi kèm với sortBy, độ dài mảng phải bằng với sortBy`
  })
  getMonthlyExportReportStatistic(
    @Query('month', new ParseDatePipe()) month: Date,
    @Query('getByEntireSystem', ParseBoolPipe) getByEntireSystem: boolean,
    @Query('listWarehouseId', new ParseArrayPipe({optional: true})) listWarehouseId: string[],
    @Query('orderBy', new ParseArrayPipe({optional: true})) orderBy: string[],
    @Query('sorts', new ParseArrayPipe({items: Number, optional: true})) sorts: number[],
  ){
    const properties = ['day', 'total_quantity', 'number_of_export_order'];
    if(orderBy != null){
      if(sorts.length != orderBy.length){
        throw new BadRequestException("sorts.length != orderBy.length");
      }
      
      for(const s of orderBy){
        if(properties.includes(s) == false){
          throw new BadRequestException("Validation fail in order by");   
        }
      }
    }

    if(getByEntireSystem == false && listWarehouseId == null){
      throw new BadRequestException("Không có danh sách warehouseId");
    }

    const statisticDto = new StatisticDto();
    statisticDto.month = month;
    statisticDto.getByEntireSystem = getByEntireSystem;
    statisticDto.listWarehouseId = listWarehouseId;
    statisticDto.orderBy = orderBy;
    statisticDto.sorts = sorts;

    return this.statisticsService.getMonthlyExportReport(statisticDto);
  }
}
