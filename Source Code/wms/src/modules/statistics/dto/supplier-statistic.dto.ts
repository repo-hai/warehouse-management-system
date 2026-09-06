import { ApiProperty } from "@nestjs/swagger"
import { Supplier } from "../../suppliers/entities/supplier.entity"
import { ProductStatisticDto } from "./product-statistic.dto"
import { WarehouseProductStatisticDto } from "./warehouse-product-statistic.dto"

export class SupplierStatisticDto extends Supplier{
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
    totalImportOrder!: number

    @ApiProperty()
    totalProduct!: number

    @ApiProperty()
    totalQuantity!: number

    @ApiProperty()
    avgQuantityPerImportOrder!: number

    @ApiProperty()
    listProductStatisticDto!: ProductStatisticDto[]

    @ApiProperty()
    listWarehouseProductStatisticDto!: WarehouseProductStatisticDto[]
}