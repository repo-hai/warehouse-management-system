import { ApiProperty } from "@nestjs/swagger"
import { IsNumberString } from "class-validator"

export class CreateWarehouseProductDto {
    @ApiProperty()
    @IsNumberString()
    productId!: string

    @ApiProperty()
    @IsNumberString()
    warehouseId!: string
}