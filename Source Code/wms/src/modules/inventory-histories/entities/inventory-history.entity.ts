import { ApiProperty } from "@nestjs/swagger";
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index, OneToOne} from "typeorm";
import { ExportOrderItem } from "../../export-orders/entities/export-order-item.entity";
import { ImportOrderItem } from "../../import-orders/entities/import-order-item.entity";
import { User } from "../../users/entities/user.entity";
import { WarehouseProductBatch } from "../../warehouses/entities/warehouse-product-batch.entity";

export enum InventoryHistoryStatus {
    IMPORTING = "importing",
    EXPORTING = "exporting",
    APPROVED_EXPORT = "approved export",
    APPROVED_IMPORT = "approved import",
    MODIFIED = "modified",
    DELETED = "deleted",
}

@Entity()
export class InventoryHistory {
    @ApiProperty()
    @PrimaryGeneratedColumn({type: "bigint"})
    id?: string;

    @ApiProperty()
    @Column({type: "int"})
    lastStock!: number;

    @ApiProperty()
    @Column({type: "int"})
    updatedStock!: number;

    @ApiProperty({enum: InventoryHistoryStatus, enumName: 'InventoryHistoryStatus'})
    @Column({type: "enum", enum: InventoryHistoryStatus})
    status!: InventoryHistoryStatus

    @ApiProperty()
    @Column({type: "varchar", length: 100, nullable: true})
    description?: string;

    @ApiProperty()
    @CreateDateColumn()
    createdAt!: Date;

    @ApiProperty()
    @UpdateDateColumn()
    updatedAt!: Date;

    @ApiProperty()
    @Column({type: "bigint", nullable: true})
    warehouseStaffId!: string

    @ApiProperty()
    @Column({type: "bigint", nullable: true})
    managerId!: string

    @ApiProperty()
    @Column({type: "bigint", nullable: true})
    warehouseProductBatchId!: string

    @ApiProperty()
    @Column({type: "bigint", nullable: true})
    importOrderItemId!: string

    @ApiProperty()
    @Column({type: "bigint", nullable: true})
    exportOrderItemId!: string

    //@ApiProperty({type: () => User})
    @ManyToOne(() => User)
    @JoinColumn()
    @Index("InventoryHistory warehouseStaffId")
    warehouseStaff!: User

    //@ApiProperty({type: () => User})
    @ManyToOne(() => User)
    @JoinColumn()
    @Index("InventoryHistory managerId")
    manager!: User

    //@ApiProperty({type: () => ImportOrderItem})
    @ManyToOne(() => ImportOrderItem)
    @JoinColumn()
    @Index("InventoryHistory importOrderId")
    importOrderItem!: ImportOrderItem

    //@ApiProperty({type: () => ExportOrderItem})
    @ManyToOne(() => ExportOrderItem)
    @JoinColumn()
    @Index("InventoryHistory exportOrderId")
    exportOrderItem!: ExportOrderItem

    //@ApiProperty({type: () => WarehouseProductBatch})
    @ManyToOne(() => WarehouseProductBatch)
    @JoinColumn()
    @Index("InventoryHistory warehouseProductBatchId")
    warehouseProductBatch!: WarehouseProductBatch
}