import { ApiProperty } from "@nestjs/swagger"

export class DailyExportReportDto{
    @ApiProperty()
    date!: Date

    @ApiProperty()
    totalExportOrder!: number
    
    @ApiProperty()
    totalQuantity!: number
}