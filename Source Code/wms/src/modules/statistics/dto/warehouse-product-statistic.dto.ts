import { ApiProperty } from "@nestjs/swagger"
import { WarehouseProduct } from "../../warehouses/entities/warehouse-product.entity"

export class WarehouseProductStatisticDto extends WarehouseProduct {
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
    totalStock!: number

    @ApiProperty()
    totalSold!: number
}