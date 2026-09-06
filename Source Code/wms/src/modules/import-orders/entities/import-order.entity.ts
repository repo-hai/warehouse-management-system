import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Supplier } from "../../suppliers/entities/supplier.entity";
import { User } from "../../users/entities/user.entity";
import { Warehouse } from "../../warehouses/entities/warehouse.entity";
import { ImportOrderItem } from "./import-order-item.entity";

export enum ImportOrderStatus {
    IMPORTING = "importing",
    IMPORT_APPROVED = "import_approved",
    MODIFIED = "modified",
}

@Entity()
export class ImportOrder {
    @ApiProperty()
    @PrimaryGeneratedColumn({type: "bigint"})
    id!: string;

    @ApiProperty()
    @Column({type: "timestamp"})
    importDate!: Date;

    @ApiProperty({enumName: "ImportOrderStatus", enum: ImportOrderStatus})
    @Column({type: "enum",enum: ImportOrderStatus})
    @Index("ImportOrder status")
    status!: ImportOrderStatus;

    @ApiPropertyOptional()
    @Column({type: "varchar", length: 100, nullable: true})
    description?: string;

    @ApiProperty()
    @CreateDateColumn()
    @Index("ImportOrder createdAt")
    createdAt!: Date;

    @ApiProperty()
    @UpdateDateColumn()
    @Index("ImportOrder updateddAt")
    updatedAt!: Date;

    @ApiProperty()
    @Column({type: "bigint", nullable: true})
    managerId!: string

    @ApiProperty()
    @Column({type: "bigint"})
    warehouseStaffId!: string

    @ApiProperty()
    @Column({type: "bigint"})
    warehouseId!: string

    @ApiProperty()
    @Column({type: "bigint"})
    supplierId!: string

    //@ApiProperty({type: Supplier})
    @ManyToOne(() => Supplier)
    @JoinColumn()
    @Index("ImportOrder supplierId")
    supplier!: Supplier

    //@ApiProperty({type: () => User})
    @ManyToOne(() => User)
    @JoinColumn()
    @Index("ImportOrder warehouseStaffId")
    warehouseStaff!: User

    //@ApiProperty({type: () => User})
    @ManyToOne(() => User)
    @JoinColumn()
    @Index("ImportOrder managerId")
    manager!: User

    //@ApiProperty({type: () => Warehouse})
    @ManyToOne(() => Warehouse)
    @JoinColumn()
    @Index("ImportOrder warehouseId")
    warehouse!: Warehouse

    @ApiProperty({type: [ImportOrderItem]})
    @OneToMany(() => ImportOrderItem, (i) => i.importOrder)
    listImportOrderItem!: ImportOrderItem[];
}