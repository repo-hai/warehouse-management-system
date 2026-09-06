import { ApiProperty } from "@nestjs/swagger"
import { Product } from "../../products/entities/product.entity"

export class ProductStatisticDto extends Product{
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

    @ApiProperty()
    earliestExpiredDate!: Date

    @ApiProperty()
    expiringQuantity!: number
}