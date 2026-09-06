import { Entity, Index, JoinColumn, ManyToOne, PrimaryColumn, Unique } from "typeorm";
import { Product } from "./product.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Category } from "../../categories/entities/category.entity";

@Entity()
export class ProductCategory {
    @ApiProperty()
    @PrimaryColumn()
    @Index("ProductCategory productId")
    productId!: string

    @ApiProperty()
    @PrimaryColumn()
    @Index("ProductCategory categoryId")
    categoryId!: string

    //@ApiProperty({type: () => Product})
    @ManyToOne(() => Product)
    @JoinColumn()
    product!: Product

    //@ApiProperty({type: () => Category})
    @ManyToOne(() => Category, (Category) => Category.listProductCategory)
    @JoinColumn()
    category!: Category
}