import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsNumber, IsOptional, IsString } from "class-validator"

export class UpdateOrderProductDto {
    @ApiProperty()
    @IsString()
    orderId!: string

    @ApiProperty()
    @IsString()
    productId!: string

    @ApiProperty()
    @IsNumber()
    quantity!: number

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description?: string
}
