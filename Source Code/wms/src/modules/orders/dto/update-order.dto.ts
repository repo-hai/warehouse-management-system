import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { ApiProperty } from '@nestjs/swagger';
import { UpdateOrderProductDto } from './update-order-product.dto';
import { IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
    @ApiProperty({type: [UpdateOrderProductDto]})
    @IsArray()
    @Type(() => UpdateOrderProductDto)
    listUpdateOrderProduct!: UpdateOrderProductDto[];
}
