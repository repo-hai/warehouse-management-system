import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsPositive, IsString } from "class-validator";

export class UpdateWarehouseProductBatchDto {
    @ApiPropertyOptional()
    @IsPositive()
    stock!: number;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    expiredAt!: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    unit!: string;
}
