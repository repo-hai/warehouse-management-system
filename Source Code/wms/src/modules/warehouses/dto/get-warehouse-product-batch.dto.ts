import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class GetWarehouseProductBatchDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    stock!: number;

    @ApiProperty()
    expiredAt!: Date;

    @ApiProperty()
    availableStock!: number;

    @ApiProperty()
    unit!: string;

    @ApiPropertyOptional()
    description!: string;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
    
    @ApiProperty()
    productId!: string

    @ApiProperty()
    warehouseId!: string
}