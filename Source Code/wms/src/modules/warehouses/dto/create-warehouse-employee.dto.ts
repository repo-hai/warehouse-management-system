import { ApiProperty } from "@nestjs/swagger"
import { IsArray, IsNumberString } from "class-validator"

export class CreateWarehouseEmployeeDto {
    @ApiProperty()
    @IsNumberString()
    warehouseId!: string 

    @ApiProperty({isArray: true})
    @IsArray()
    listEmployeeId!: string[]
}