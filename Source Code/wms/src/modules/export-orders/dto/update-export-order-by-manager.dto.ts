import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString } from 'class-validator';

export class UpdateExportOrderByManagerDto{
    @ApiProperty()
    @IsNumberString()
    exportOrderId!: string;

    @ApiProperty()
    @IsNumberString()
    warehouseId!: string;
}
