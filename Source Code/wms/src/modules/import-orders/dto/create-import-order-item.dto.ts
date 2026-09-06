import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumberString, IsOptional, IsPositive, IsString } from "class-validator";

export class CreateImportOrderItemDto {
    @ApiProperty()
    @IsNumberString()
    productId!: string

    @ApiProperty()
    @IsPositive()
    quantity!: number

    @ApiProperty()
    @IsString()
    unit!: string

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description?: string

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    expiredAt!: string
}
