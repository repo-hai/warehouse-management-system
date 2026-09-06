import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class GetProductDto {
    @ApiProperty()
    id!: string

    @ApiProperty()
    name!: string;

    @ApiProperty()
    weight!: string;

    @ApiProperty()
    dimension!: string;

    @ApiPropertyOptional()
    description?: string;

    @ApiProperty()
    totalAvailableStock?: number;

    @ApiProperty()
    totalStock?: number;
}
