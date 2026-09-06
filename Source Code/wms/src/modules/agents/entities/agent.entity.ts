
import { ApiProperty } from "@nestjs/swagger";
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn, Unique, Index } from "typeorm";
import { Order } from "../../orders/entities/order.entity";
import { ExportOrder } from "../../export-orders/entities/export-order.entity";

@Entity()
@Unique("UNIQUE agentName", ["name"])
@Unique("UNIQUE agentEmail", ["email"])
@Unique("UNIQUE agentPhoneNumber", ["phoneNumber"])
export class Agent {
    @ApiProperty()
    @PrimaryGeneratedColumn({type: "bigint"})
    id!: string;

    @ApiProperty()
    @Column({type: "varchar", length: 100})
    @Index("Agent name")
    name!: string;

    @ApiProperty()
    @Column({ type: "varchar", length: 20 })
    hostName!: string;

    @ApiProperty()
    @Column({type: "varchar", length: 13})
    phoneNumber!: string;

    @ApiProperty()
    @Column({type: "varchar", length: 100, nullable: true})
    address!: string;

    @ApiProperty()
    @Column({type: "varchar", length: 100, nullable: true})
    email!: string;

    @ApiProperty()
    @CreateDateColumn()
    createdAt!: Date;

    @ApiProperty()
    @UpdateDateColumn()
    updatedAt!: Date;

    //@ApiProperty({type: () => [Order]})
    @OneToMany(() => Order, (Order) => Order.agent)
    listOrder!: Order[]

    //@ApiProperty({type: () => [ExportOrder]})
    @OneToMany(() => ExportOrder, (ExportOrder) => ExportOrder.agent)
    listExportOrder!: ExportOrder[]
}