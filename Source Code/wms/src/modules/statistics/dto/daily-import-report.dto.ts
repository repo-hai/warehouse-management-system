import { ApiProperty } from "@nestjs/swagger"

export class DailyImportReportDto{
    @ApiProperty()
    date!: Date

    @ApiProperty()
    totalImportOrder!: number
    
    @ApiProperty()
    totalQuantity!: number
}