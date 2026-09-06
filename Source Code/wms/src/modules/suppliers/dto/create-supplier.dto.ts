import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsPhoneNumber, IsString } from "class-validator";

export class CreateSupplierDto {
    @ApiProperty()
    @IsString()
    name!: string;

    @ApiProperty()
    @IsString()
    representativeName!: string;

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
