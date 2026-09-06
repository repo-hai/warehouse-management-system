import { ApiProperty } from "@nestjs/swagger"

export class StatisticDto {
    @ApiProperty()
    startDate!: Date

    @ApiProperty()
    endDate!: Date

    @ApiProperty()
    month!: Date

    @ApiProperty()
    day!: number

    @ApiProperty()
    listProductId!: string[]

    @ApiProperty()
    getByEntireSystem!: boolean

    @ApiProperty()
    listWarehouseId!: string[]

    @ApiProperty()
    sorts!: number[]

    @ApiProperty()
    orderBy!: string[]
}