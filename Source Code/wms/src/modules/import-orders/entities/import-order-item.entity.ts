import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { ImportOrder } from "./import-order.entity";
import { ApiProperty } from "@nestjs/swagger";
import { InventoryHistory } from "../../inventory-histories/entities/inventory-history.entity";
import { WarehouseProductBatch } from "../../warehouses/entities/warehouse-product-batch.entity";
import { WarehouseProduct } from "../../warehouses/entities/warehouse-product.entity";

@Entity()
export class ImportOrderItem {
    @ApiProperty()
    @PrimaryGeneratedColumn({type: "bigint"})
    id!: string;

    @ApiProperty()
    @Column({type: "timestamp"})
    expiredAt!: Date

    @ApiProperty()
    @Column({type: "int"})
    quantity!: number

    @ApiProperty()
    @Column({type: "varchar", length: 30})
    unit!: string

    @ApiProperty()
    @Column({type: "varchar", length: 100, nullable: true})
    description?: string

    @ApiProperty()
    @Column({type: "bigint"})
    importOrderId!: string

    @ApiProperty()
    @Column({type: "bigint"})
    productId!: string

    @ApiProperty()
    @Column({type: "bigint"})
    warehouseId!: string

    //@ApiProperty({type: () => ImportOrder})
    @ManyToOne(() => ImportOrder)
    @JoinColumn()
    @Index("ImportOrderItem importOrderId")
    importOrder!: ImportOrder

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
    @Index("ImportOrderItem COMPOSITE INDEX warehouseProduct")
    warehouseProduct!: WarehouseProduct

    //@ApiProperty({type: () => [InventoryHistory]})
    @OneToMany(() => InventoryHistory, (i) => i.importOrderItem)
    listInventoryHistory!: InventoryHistory[]

    //@ApiProperty({type: () => WarehouseProductBatch})
    @OneToOne(() => WarehouseProductBatch, (wp) => wp.importOrderItem)
    @JoinColumn()
    @Index("ImportOrderItem warehouseProductBatchId")
    warehouseProductBatch!: WarehouseProductBatch
}