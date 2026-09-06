import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "../entities/user.entity";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";

export class CreateUserDto {
    @ApiProperty()
    @IsString()
    name!: string;

    @ApiProperty()
    @IsString()
    username!: string;

    @ApiProperty()
    @IsNotEmpty()
    password!: string;

    @ApiProperty()
    @IsString()
    phoneNumber!: string;

    @ApiProperty({enumName: 'UserRole', enum: UserRole})
    @IsEnum(UserRole)
    role!: UserRole;
}
