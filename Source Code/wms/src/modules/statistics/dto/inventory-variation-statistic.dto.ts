import { ApiProperty } from "@nestjs/swagger"
import { InventoryHistory } from "../../inventory-histories/entities/inventory-history.entity"

export class InventoryVariationDto{
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
    totalIncrease!: number
    
    @ApiProperty()
    totalDecrease!: number
    
    @ApiProperty()
    totalVariation!: number
    
    @ApiProperty()
    listInventoryHistory!: InventoryHistory[]
}