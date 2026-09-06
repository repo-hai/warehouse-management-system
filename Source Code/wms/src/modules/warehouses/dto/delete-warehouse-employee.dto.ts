import { ApiProperty } from "@nestjs/swagger"
import { IsNumberString } from "class-validator"

export class DeleteWarehouseEmployeeDto {
    @ApiProperty()
    @IsNumberString()
    warehouseId!: string 

    @ApiProperty()
    @IsNumberString()
    employeeId!: string
}