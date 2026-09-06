import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { InventoryHistory } from "../../inventory-histories/entities/inventory-history.entity";
import { WarehouseProductBatch } from "../../warehouses/entities/warehouse-product-batch.entity";
import { WarehouseProduct } from "../../warehouses/entities/warehouse-product.entity";
import { ExportOrder } from "./export-order.entity";

@Entity()
export class ExportOrderItem {
    @ApiProperty()
    @PrimaryGeneratedColumn({type: "bigint"})
    id!: string;

    @ApiProperty()
    @Column({type: "int"})
    quantity!: number

    @ApiProperty()
    @Column({type: "bigint"})
    exportOrderId!: string

    @ApiProperty()
    @Column({type: "bigint"})
    productId!: string

    @ApiProperty()
    @Column({type: "bigint"})
    warehouseId!: string

    @ApiProperty()
    @Column({type: "bigint"})
    warehouseProductBatchId!: string

    //@ApiProperty({type: () => ExportOrder})
    @ManyToOne(() => ExportOrder)
    @JoinColumn()
    @Index("ExportOrderItem exportOrderId")
    exportOrder!: ExportOrder

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
    @Index("ExportOrderItem COMPOSITE INDEX warehouseProduct")
    warehouseProduct!: WarehouseProduct

    //@ApiProperty({type: () => WarehouseProductBatch})
    @ManyToOne(() => WarehouseProductBatch)
    @JoinColumn()
    @Index("ExportOrderItem product")
    warehouseProductBatch!: WarehouseProductBatch

    //@ApiProperty({type: () => [InventoryHistory]})
    @OneToMany(() => InventoryHistory, (ih) => ih.exportOrderItem)
    listInventoryHistory!: InventoryHistory[]
}