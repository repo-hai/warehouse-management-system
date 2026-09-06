import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateWarehouseDto {
    @ApiProperty()
    @IsString()
    name!: string;

    @ApiProperty()
    @IsString()
    address!: string;
}
