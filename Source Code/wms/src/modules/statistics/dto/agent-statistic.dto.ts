import { ApiProperty } from "@nestjs/swagger"
import { ProductStatisticDto } from "./product-statistic.dto"
import { WarehouseProductStatisticDto } from "./warehouse-product-statistic.dto"
import { Agent } from "../../agents/entities/agent.entity"

export class AgentStatisticDto extends Agent{
    @ApiProperty()
    startDate!: Date

    @ApiProperty()
    endDate!: Date

    @ApiProperty()
    getByEntireSystem!: boolean
    
    @ApiProperty()
    getByWarehouses!: boolean
    
    @ApiProperty()
    listWarehouseId!: string[]
    
    @ApiProperty()
    sorts!: string[]
    
    @ApiProperty()
    orderBy!: string[]
    
    @ApiProperty()
    totalExportOrder!: number
    
    @ApiProperty()
    totalQuantity!: number
    
    @ApiProperty()
    avgQuantityPerExportOrder!: number
    
    @ApiProperty({type: () => [ProductStatisticDto]})
    listProductStatistic!: ProductStatisticDto[]
    
    @ApiProperty({type: () => [WarehouseProductStatisticDto]})
    listWarehouseProductStatistic!: WarehouseProductStatisticDto[]
}