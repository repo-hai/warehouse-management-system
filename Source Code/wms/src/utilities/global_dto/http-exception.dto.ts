import { ApiProperty } from "@nestjs/swagger"

export class HttpExceptionDto {
    @ApiProperty()
    statusCode!: number
    
    @ApiProperty()
    message!: string
}