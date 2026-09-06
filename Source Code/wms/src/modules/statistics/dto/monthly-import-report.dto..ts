import { ApiProperty } from "@nestjs/swagger"
import { DailyImportReportDto } from "./daily-import-report.dto"
import { StatisticDto } from "./statistic.dto"

export class MonthlyImportReportDto extends StatisticDto{
    @ApiProperty()
    totalImportOrder!: number
    
    @ApiProperty()
    totalImportOrderItem!: number
    
    @ApiProperty()
    totalProduct!: number
    
    @ApiProperty()
    totalQuantity!: number
    
    @ApiProperty()
    chartData!: DailyImportReportDto[]
}