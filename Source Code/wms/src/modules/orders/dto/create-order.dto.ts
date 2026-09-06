import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsArray, IsOptional, IsString } from "class-validator"
import { CreateOrderProductDto } from "./create-order-product.dto"
import { Type } from "class-transformer"

export class CreateOrderDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    deadline!: string

    @ApiProperty()
    @IsString()
    deliveryTo!: string

    @ApiProperty()
    @IsString()
    receiverPhoneNumber!: string

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description?: string

    @ApiProperty()
    @IsString()
    warehouseId!: string

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    requestedWarehouseId!: string

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    agentId!: string

    @ApiProperty({type: [CreateOrderProductDto]})
    @IsArray()
    @Type(() => CreateOrderProductDto)
    listOrderProduct!: CreateOrderProductDto[]
}
