import { ApiProperty } from "@nestjs/swagger"
import { ImportOrder } from "../../import-orders/entities/import-order.entity"

export class ImportStatisticDto extends ImportOrder{
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
    totalQuantity!: number

    @ApiProperty()
    totalProduct!: number

    @ApiProperty()
    avgQuantityPerImportOrder!: number
}