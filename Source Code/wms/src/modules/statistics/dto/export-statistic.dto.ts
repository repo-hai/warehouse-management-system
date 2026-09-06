import { ApiProperty } from "@nestjs/swagger"
import { ExportOrder } from "../../export-orders/entities/export-order.entity"

export class ExportStatisticDto extends ExportOrder{
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
    totalProduct!: number

    @ApiProperty()
    avgQuantityPerExportOrder!: number
}