import { ApiProperty } from "@nestjs/swagger";
import { IsNumberString } from "class-validator";

export class DeleteWarehouseProductDto {
    @ApiProperty()
    @IsNumberString()
    productId!: string;

    @ApiProperty()
    @IsNumberString()
    warehouseId!: string;
}
