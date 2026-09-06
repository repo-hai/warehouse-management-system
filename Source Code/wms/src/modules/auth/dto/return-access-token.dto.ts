import { ApiProperty } from "@nestjs/swagger"
import { IsString } from "class-validator"

export class ReturnAccessTokenDto {
    @ApiProperty()
    @IsString()
    accessToken!: string
}