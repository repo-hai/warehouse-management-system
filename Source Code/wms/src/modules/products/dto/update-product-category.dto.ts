import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsArray, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UpdateCategoryDto } from '../../categories/dto/update-category.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {
    @ApiPropertyOptional({type: [UpdateCategoryDto]})
    @IsArray()
    @IsOptional()
    @Type(() => UpdateCategoryDto)
    listCategory!: UpdateCategoryDto[]
}
