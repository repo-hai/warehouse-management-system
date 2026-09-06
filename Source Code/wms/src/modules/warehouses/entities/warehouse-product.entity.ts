import { Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { Warehouse } from "./warehouse.entity";
import { ApiProperty } from "@nestjs/swagger";
import { ExportOrderItem } from "../../export-orders/entities/export-order-item.entity";
import { ImportOrderItem } from "../../import-orders/entities/import-order-item.entity";
import { Product } from "../../products/entities/product.entity";
import { WarehouseProductBatch } from "./warehouse-product-batch.entity";

@Entity()
export class WarehouseProduct {
    @ApiProperty()
    @PrimaryColumn({type: "bigint"})
    @Index("Warehouse warehouseId")
    warehouseId!: string

    @ApiProperty()
    @PrimaryColumn({type: "bigint"})
    @Index("Warehouse productId")
    productId!: string

    //@ApiProperty({type: () => Warehouse})
    @ManyToOne(() => Warehouse)
    @JoinColumn()
    warehouse!: Warehouse

    //@ApiProperty({type: () => Product})
    @ManyToOne(() => Product)
    @JoinColumn()
    product!: Product

    //@ApiProperty({type: () => [WarehouseProductBatch]})
    @OneToMany(() => WarehouseProductBatch, (WarehouseProductBatch) => WarehouseProductBatch.warehouseProduct)
    listWarehouseProductBatch!: WarehouseProductBatch[]

    //@ApiProperty({type: () => [ExportOrderItem]})
    @OneToMany(() => ExportOrderItem, (ExportOrderItem) => ExportOrderItem.warehouseProduct)
    listExportOrderItem!: ExportOrderItem[]

    //@ApiProperty({type: () => [ImportOrderItem]})
    @OneToMany(() => ImportOrderItem, (ImportOrderItem) => ImportOrderItem.warehouseProduct)
    listImportOrderItem!: ImportOrderItem[]
}

