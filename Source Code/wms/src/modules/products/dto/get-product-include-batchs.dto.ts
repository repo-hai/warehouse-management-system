import { ApiProperty } from "@nestjs/swagger";
import { GetWarehouseProductBatchDto } from "../../warehouses/dto/get-warehouse-product-batch.dto";
import { IsArray } from "class-validator";
import { GetProductDto } from "./get-product.dto";

export class GetProductIncludeBatchsDto extends GetProductDto{
    @ApiProperty({type: () => [GetWarehouseProductBatchDto]})
    @IsArray()
    listBatchs!: GetWarehouseProductBatchDto[]
}