import { ApiProperty } from "@nestjs/swagger";
import { Agent } from "../../agents/entities/agent.entity"
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn, Index} from "typeorm";
import { ExportOrder } from "../../export-orders/entities/export-order.entity";
import { Warehouse } from "../../warehouses/entities/warehouse.entity";
import { OrderProduct } from "./order-product.entity";

export enum OrderStatus {
    PROCESSING = "processing",
    COMPLETED = "completed"
}

@Entity()
export class Order {
    @ApiProperty()
    @PrimaryGeneratedColumn({type: "bigint"})
    id!: string;

    @ApiProperty()
    @Column({type: "timestamp", nullable: true})
    deadline!: Date;

    @ApiProperty()
    @Column({type: "varchar", length: 100})
    deliveryTo!: string;

    @ApiProperty()
    @Column({type: "varchar", length: 15})
    receiverPhoneNumber!: string;

    @ApiProperty()
    @Column({type: "enum", enum: OrderStatus})
    @Index("Order status")
    status!: OrderStatus;

    @ApiProperty()
    @Column({type: "varchar", length: 50, nullable: true})
    description?: string;

    @ApiProperty()
    @CreateDateColumn()
    @Index("Order createdAt")
    createdAt!: Date;

    @ApiProperty()
    @UpdateDateColumn()
    updatedAt!: Date;

    @ApiProperty()
    @Column({type: "bigint"})
    warehouseId!: string

    @ApiProperty()
    @Column({type: "bigint", nullable: true})
    agentId!: string

    @ApiProperty()
    @Column({type: "bigint", nullable: true})
    requestedWarehouseId!: string

    //@ApiProperty({type: () => Warehouse})
    @ManyToOne(() => Warehouse)
    @JoinColumn()
    @Index("Order warehouseId")
    warehouse!: Warehouse

    //@ApiProperty({type: () => Agent})
    @ManyToOne(() => Agent)
    @JoinColumn()
    @Index("Order agentId")
    agent!: Agent

    //@ApiProperty({type: () => [OrderProduct]})
    @OneToMany(() => OrderProduct, (OrderProduct) => OrderProduct.order)
    listOrderProduct!: OrderProduct[]

    //@ApiProperty({type: () => [ExportOrder]})
    @OneToMany(() => ExportOrder, (ExportOrder) => ExportOrder.order)
    listExportOrder!: ExportOrder[]

    //@ApiProperty({type: () => Warehouse})
    @ManyToOne(() => Warehouse)
    @JoinColumn()
    @Index("Order requestedWarehouse")
    requestedWarehouse!: Warehouse
}