import { ApiProperty } from "@nestjs/swagger"
import { IsNumberString, IsString } from "class-validator"

export class CreateWarehouseProductBatchDto {
    @ApiProperty()
    @IsNumberString()
    id!: string

    @ApiProperty()
    @IsNumberString()
    warehouseId!: string
    
    @ApiProperty()
    @IsNumberString()
    employeeId!: string

    @ApiProperty()
    @IsString()
    quantity!: number
}