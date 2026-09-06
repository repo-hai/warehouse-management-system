import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumberString } from "class-validator";

export class DeleteProductCategoryDto {
    @ApiProperty()
    @IsNumberString()
    categoryId!: string

    @ApiProperty()
    @IsArray()
    listProductId!: string[]
}