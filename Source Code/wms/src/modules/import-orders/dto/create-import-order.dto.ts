import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CreateImportOrderItemDto } from "./create-import-order-item.dto";
import { IsArray, IsNumberString, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class CreateImportOrderDto {
    @ApiProperty()
    @IsString()
    importDate!: string

    // @ApiProperty({enumName: 'ImportOrderStatus', enum: ImportOrderStatus})
    // @IsEnum(ImportOrderStatus)
    // status!: ImportOrderStatus

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description?: string

    @ApiProperty()
    @IsNumberString()
    supplierId!: string
    
    @ApiProperty()
    @IsNumberString()
    warehouseStaffId!: string

    // @ApiProperty()
    // @IsString()
    // managerId!: string

    @ApiProperty()
    @IsNumberString()
    warehouseId!: string

    @ApiProperty({type: [CreateImportOrderItemDto]})
    @IsArray()
    @Type(() => CreateImportOrderItemDto)
    listImportOrderItemDto!: CreateImportOrderItemDto[]
}
