import { ApiProperty } from "@nestjs/swagger"
import { ProductStatisticDto } from "./product-statistic.dto"

export class StockStatisticDto {
    @ApiProperty()
    totalStock!: number

    @ApiProperty()
    listProductStatisticDto!: ProductStatisticDto[]
}