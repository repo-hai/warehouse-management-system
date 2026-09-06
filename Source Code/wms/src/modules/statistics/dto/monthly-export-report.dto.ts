import { ApiProperty } from "@nestjs/swagger"
import { DailyExportReportDto } from "./daily-export-report.dto"
import { StatisticDto } from "./statistic.dto"

export class MonthlyExportReportDto extends StatisticDto{
    @ApiProperty()
    totalExportOrder!: number
    
    @ApiProperty()
    totalExportOrderItem!: number
    
    @ApiProperty()
    totalProduct!: number
    
    @ApiProperty()
    totalQuantity!: number
    
    @ApiProperty()
    chartData!: DailyExportReportDto[]
}