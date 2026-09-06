import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ExportOrderItem } from "../../export-orders/entities/export-order-item.entity";
import { ImportOrderItem } from "../../import-orders/entities/import-order-item.entity";
import { InventoryHistory } from "../../inventory-histories/entities/inventory-history.entity";
import { WarehouseProduct } from "./warehouse-product.entity";

@Entity()
export class WarehouseProductBatch {
    @ApiProperty()
    @PrimaryGeneratedColumn({type: "bigint"})
    id!: string;

    @ApiProperty()
    @Column({type: "int"})
    stock!: number;

    @ApiProperty()
    @Column({type: "timestamp"})
    expiredAt!: Date;

    @ApiProperty()
    @Column({type: "int"})
    availableStock!: number;

    @ApiProperty()
    @Column({nullable: true, type: 'varchar', length: 30})
    unit!: string;

    @ApiPropertyOptional()
    @Column({type: "varchar", length: 100, nullable: true})
    description?: string;

    @ApiProperty()
    @CreateDateColumn()
    createdAt!: Date;

    @ApiProperty()
    @UpdateDateColumn()
    updatedAt!: Date;
    
    @ApiProperty()
    @Column({type: "bigint"})
    productId!: string

    @ApiProperty()
    @Column({type: "bigint"})
    warehouseId!: string

    //@ApiProperty({type: () => WarehouseProduct})
    @ManyToOne(() => WarehouseProduct)
    @JoinColumn([
        {
            name: "productId",
            referencedColumnName: "productId"
        },
        {
            name: "warehouseId",
            referencedColumnName: "warehouseId"
        }
    ])
    @Index("Warehouse COMPOSITE INDEX warehouseProduct")
    warehouseProduct!: WarehouseProduct;

    //@ApiProperty({type: () => [InventoryHistory]})
    @OneToMany(() => InventoryHistory, (IH) => IH.warehouseProductBatch)
    inventoryHistories!: InventoryHistory[];

    //@ApiProperty({type: () => ImportOrderItem})
    @OneToOne(() => ImportOrderItem, (IOI) => IOI.warehouseProductBatch)
    importOrderItem!: ImportOrderItem;

    //@ApiProperty({type: () => [ExportOrderItem]})
    @OneToMany(() => ExportOrderItem, (EOI) => EOI.warehouseProductBatch)
    exportOrderItems!: ExportOrderItem[];
}