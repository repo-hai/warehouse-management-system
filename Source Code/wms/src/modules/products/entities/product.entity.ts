import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import { ProductCategory } from "./product-category.entitiy";
import { ApiProperty } from "@nestjs/swagger";
import { OrderProduct } from "../../orders/entities/order-product.entity";
import { WarehouseProduct } from "../../warehouses/entities/warehouse-product.entity";

@Entity()
export class Product {
    @ApiProperty()
    @PrimaryGeneratedColumn({type: "bigint"})
    id!: string;

    @ApiProperty()
    @Column({type: "varchar", length: 100})
    @Index("Product name")
    name!: string;

    @ApiProperty()
    @Column({type: "varchar", length: 20, nullable: true})
    weight!: string;

    @ApiProperty()
    @Column({type: "varchar", length: 30, nullable: true})
    dimension!: string;

    @ApiProperty()
    @Column({type: "varchar", length: 100, nullable: true})
    description!: string;

    @ApiProperty()
    @CreateDateColumn()
    createdAt!: Date;

    @ApiProperty()
    @UpdateDateColumn()
    updatedAt!: Date;

    //@ApiProperty({type: () => [ProductCategory]})
    @OneToMany(() => ProductCategory, (ProductCategory) => ProductCategory.product)
    productCategory!: ProductCategory[]

    //@ApiProperty({type: () => [WarehouseProduct]})
    @OneToMany(() => WarehouseProduct, (WarehouseProduct) => WarehouseProduct.product)
    listWarehouseProducts!: WarehouseProduct[]

    //@ApiProperty({type: () => [OrderProduct]})
    @OneToMany(() => OrderProduct, (OrderProduct) => OrderProduct.product)
    listOrderProduct!: OrderProduct[]
}