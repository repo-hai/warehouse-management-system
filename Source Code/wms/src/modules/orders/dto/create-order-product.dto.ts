import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsNumber, IsOptional, IsString } from "class-validator"

export class CreateOrderProductDto {
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
