
import { IsArray, IsNumber, IsNumberString } from "class-validator"
import { Type } from "class-transformer"
import { ApiProperty } from "@nestjs/swagger"
import { CreateWarehouseProductBatchDto } from "../../warehouses/dto/create-warehoue-product-batch.dto"

export class CreateExportOrderItemDto {
    @ApiProperty()
    @IsNumber()
    quantity!: number    

    @ApiProperty()
    @IsNumberString()
    productId!: string

    @ApiProperty({type: [CreateWarehouseProductBatchDto]})
    @IsArray()
    @Type(() => CreateWarehouseProductBatchDto)
    listWarehouseProductBatchDto!: CreateWarehouseProductBatchDto[]
}
