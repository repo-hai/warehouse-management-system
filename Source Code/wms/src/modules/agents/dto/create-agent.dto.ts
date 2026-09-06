import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsEmail } from "class-validator";

export class CreateAgentDto {
    @ApiProperty()
    @IsString()
    name!: string;

    @ApiProperty()
    @IsString()
    hostName!: string;

    @ApiProperty()
    @IsString()
    phoneNumber!: string;

    @ApiProperty()
    @IsString()
    address!: string;

    @ApiProperty()
    @IsEmail()
    email!: string;
}
