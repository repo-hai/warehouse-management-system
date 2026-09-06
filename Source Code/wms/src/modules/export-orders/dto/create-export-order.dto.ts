import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CreateExportOrderItemDto } from "./create-export-order-item.dto";
import { IsArray, IsNumber, IsNumberString, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class CreateExportOrderDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    exportedAt!: string;

    @ApiProperty()
    @IsNumber()
    currentTimeStamp!: number;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description!: string;

    @ApiProperty()
    @IsNumberString()
    warehouseStaffId!: string;

    @ApiProperty()
    @IsNumberString()
    warehouseId!: string;

    @ApiProperty()
    @IsNumberString()
    agentId!: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumberString()
    orderId!: string

    @ApiProperty({type: [CreateExportOrderItemDto]})
    @IsArray()
    @Type(() => CreateExportOrderItemDto)
    listExportOrderItemDto!: CreateExportOrderItemDto[];
}
