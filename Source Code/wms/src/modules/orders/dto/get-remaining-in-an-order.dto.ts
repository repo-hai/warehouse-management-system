
import { OrderStatus } from "../entities/order.entity";
import { Agent } from "http";
import { OrderProduct } from "../entities/order-product.entity";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Warehouse } from "../../warehouses/entities/warehouse.entity";

export class GetRemainingInAnOrder{
    @ApiProperty()
    id!: string;

    @ApiProperty()
    deadline!: Date;

    @ApiProperty()
    deliveryTo!: string;

    @ApiProperty()
    receiverPhoneNumber!: string;

    @ApiProperty({enum: OrderStatus, enumName: 'OrderStatus'})
    status!: OrderStatus;

    @ApiPropertyOptional()
    description?: string;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;

    @ApiProperty()
    warehouseId!: string

    @ApiProperty()
    agentId!: string

    @ApiProperty()
    requestedWarehouseId!: string

    @ApiProperty()
    warehouse!: Warehouse

    @ApiProperty()
    agent!: Agent

    @ApiProperty()
    listOrderProduct!: OrderProduct[]

    @ApiProperty()
    listRemainingOrderProduct!: OrderProduct[]
}