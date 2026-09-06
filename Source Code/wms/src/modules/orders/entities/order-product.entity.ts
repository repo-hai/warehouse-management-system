import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Order } from "./order.entity";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Product } from "../../products/entities/product.entity";

@Entity()
export class OrderProduct {
    @ApiProperty()
    @PrimaryColumn()
    @Index("OrderProduct productId")
    productId!: string

    @ApiProperty()
    @PrimaryColumn()
    @Index("OrderProduct orderId")
    orderId!: string

    @ApiProperty()
    @Column({type: "int"})
    quantity!:  number;

    @ApiPropertyOptional()
    @Column({type: "varchar", length: 50, nullable: true})
    description?: string;

    //@ApiProperty({type: () => Product})
    @ManyToOne(() => Product)
    @JoinColumn()
    product!: Product

    //@ApiProperty({type: () => Order})
    @ManyToOne(() => Order)
    @JoinColumn()
    order!: Order
}