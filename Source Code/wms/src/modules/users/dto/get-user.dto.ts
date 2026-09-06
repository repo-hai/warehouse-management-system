import { ApiProperty, OmitType } from "@nestjs/swagger";
import { CreateUserDto } from "./create-user.dto";
import { IsNumberString } from "class-validator";

export class GetUserDto extends OmitType(CreateUserDto, []) {
    @ApiProperty()
    @IsNumberString()
    id!: string
}
