import { ApiProperty } from "@nestjs/swagger";
import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Order } from "../../orders/entities/order.entity";
import { User } from "../../users/entities/user.entity";
import { Warehouse } from "../../warehouses/entities/warehouse.entity";
import { ExportOrderItem } from "./export-order-item.entity";
import { Agent } from "../../agents/entities/agent.entity";

export enum ExportOrderStatus {
    EXPORTING = "exporting",
    MODIFIED = "modified",
    APPROVED_EXPORT = "approved export" 
}

@Entity()
export class ExportOrder {
    @ApiProperty()
    @PrimaryGeneratedColumn({type: "bigint"})
    id!: string;

    @ApiProperty()
    @Column({type: "timestamp", nullable: true})
    @Index("ExportOrder exportAt")
    exportedAt!: Date;

    @ApiProperty()
    @Column({type: "enum", enum: ExportOrderStatus})
    @Index("ExportOrder status")
    status!: ExportOrderStatus;

    @ApiProperty()
    @Column({type: "varchar", length: 100, nullable: true})
    description!: string;

    @ApiProperty()
    @CreateDateColumn()
    @Index("ExportOrder createdAt")
    createdAt!: Date;

    @ApiProperty()
    @UpdateDateColumn()
    @Index("ExportOrder updatedAt")
    updatedAt!: Date;

    @ApiProperty()
    @Column({type: "bigint"})
    warehouseStaffId!: string
    
    @ApiProperty()
    @Column({type: "bigint", nullable: true})
    managerId!: string

    @ApiProperty()
    @Column({type: "bigint", nullable: true})
    orderId!: string

    @ApiProperty()
    @Column({type: "bigint"})
    warehouseId!: string

    @ApiProperty()
    @Column({type: "bigint"})
    agentId!: string

    //@ApiProperty({type: () => Agent})
    @ManyToOne(() => Agent)
    @JoinColumn()
    @Index("ExportOrder agentId")
    agent!: Agent

    //@ApiProperty({type: () => Warehouse})
    @ManyToOne(() => Warehouse)
    @JoinColumn()
    @Index("ExportOrder warehouseId")
    warehouse!: Warehouse

    //@ApiProperty({type: () => User})
    @ManyToOne(() => User)
    @JoinColumn()
    @Index("ExportOrder warehouseStaffId")
    warehouseStaff!: User

    //@ApiProperty({type: () => User})
    @ManyToOne(() => User)
    @JoinColumn()
    @Index("ExportOrder managerId")
    manager!: User

    //@ApiProperty({type: () => Order})
    @ManyToOne(() => Order)
    @JoinColumn()
    @Index("ExportOrder orderId")
    order!: Order

    @ApiProperty({type: () => [ExportOrderItem]})
    @OneToMany(() => ExportOrderItem, (e) => e.exportOrder)
    listExportOrderItem!: ExportOrderItem[];
}