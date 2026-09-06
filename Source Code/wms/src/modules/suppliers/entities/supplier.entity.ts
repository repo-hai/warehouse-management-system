
import { ApiProperty } from "@nestjs/swagger";
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, UpdateDateColumn, CreateDateColumn, Unique, Index } from "typeorm";
import { ImportOrder } from "../../import-orders/entities/import-order.entity";

@Entity()
@Unique("UNIQUE Supplier email", ["email"])
@Unique("UNIQUE Supplier phoneNumber", ["phoneNumber"])
export class Supplier {
    @ApiProperty()
    @PrimaryGeneratedColumn({type: "bigint"})
    id!: string;

    @ApiProperty()
    @Column({type: "varchar", length: 100})
    @Index("Supplier name")
    name!: string;

    @ApiProperty()
    @Column({type: "varchar", length: 20, nullable: true})
    representativeName!: string;

    @ApiProperty()
    @Column({type: "varchar", length: 13})
    phoneNumber!: string;

    @ApiProperty()
    @Column({type: "varchar", length: 100})
    address!: string;

    @ApiProperty()
    @Column({type: "varchar", length: 40})
    email!: string;

    @ApiProperty()
    @CreateDateColumn()
    createdAt!: Date;

    @ApiProperty()
    @UpdateDateColumn()
    updatedAt!: Date;

    //@ApiProperty({type: () => [ImportOrder]})
    @OneToMany(() => ImportOrder, (ImportOrder) => ImportOrder.supplier)
    importOrders!: ImportOrder[];
}