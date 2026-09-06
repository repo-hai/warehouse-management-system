import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IsNumberString, IsString } from "class-validator";
import { CreateImportOrderItemDto } from "./create-import-order-item.dto";

export class UpdateImportOrderItemDto extends OmitType(CreateImportOrderItemDto, []) {
    @ApiProperty()
    @IsNumberString()
    id!: string

    @ApiProperty()
    @IsString()
    expiredAt!: string

    @ApiProperty()
    @IsString()
    unit!: string
}
