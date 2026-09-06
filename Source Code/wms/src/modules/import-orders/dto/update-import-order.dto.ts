import { CreateImportOrderDto } from './create-import-order.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsArray, IsNumberString } from 'class-validator';
import { UpdateImportOrderItemDto } from './update-import-order-item.dto';
import { Type } from 'class-transformer';

export class UpdateImportOrderDto extends OmitType(CreateImportOrderDto, ['listImportOrderItemDto']) {
    @ApiProperty()
    @IsNumberString()
    id!: string

    @ApiProperty({type: [UpdateImportOrderItemDto]})
    @IsArray()
    @Type(() => UpdateImportOrderItemDto)
    listUpdateImportOrderItemDto!: UpdateImportOrderItemDto[]
}
