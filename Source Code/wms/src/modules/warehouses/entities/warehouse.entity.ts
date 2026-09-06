import { Entity, Column, PrimaryGeneratedColumn, OneToMany, UpdateDateColumn, CreateDateColumn, Index, JoinColumn} from "typeorm";
import { WarehouseEmployee } from "./warehouse-employee.entity";
import { WarehouseProduct } from "./warehouse-product.entity";
import { ApiProperty } from "@nestjs/swagger";
import { ExportOrder } from "../../export-orders/entities/export-order.entity";
import { ImportOrder } from "../../import-orders/entities/import-order.entity";
import { Order } from "../../orders/entities/order.entity";

@Entity()
export class Warehouse {
    @ApiProperty()
    @PrimaryGeneratedColumn({type: "bigint"})
    id!: string;

    @ApiProperty()
    @Column({type: "varchar", length: 100})
    @Index("Warehouse name")
    name!: string;

    @ApiProperty()
    @Column({type: "varchar", length: 100, nullable: true})
    address!: string;

    @ApiProperty()
    @CreateDateColumn()
    createdAt!: Date;

    @ApiProperty()
    @UpdateDateColumn()
    updatedAt!: Date;

    //@ApiProperty({type: () => [Order]})
    @OneToMany(() => Order, (Order) => Order.warehouse)
    @JoinColumn()
    requestedOrders!: Order[]

    //@ApiProperty({type: () => [WarehouseEmployee]})
    @OneToMany(() => WarehouseEmployee, (WarehouseEmployee) => WarehouseEmployee.warehouse)
    listEmployee!: WarehouseEmployee[]

    //@ApiProperty({type: () => [ExportOrder]})
    @OneToMany(() => ExportOrder, (ExportOrder) => ExportOrder.warehouse)
    listExportOrder!: ExportOrder[]

    //@ApiProperty({type: () => [WarehouseProduct]})
    @OneToMany(() => WarehouseProduct, (WarehouseProduct) => WarehouseProduct.warehouse)
    listWarehouseProduct!: WarehouseProduct[]

    //@ApiProperty({type: () => [ImportOrder]})
    @OneToMany(() => ImportOrder, (ImportOrder) => ImportOrder.warehouse)
    importOrders!: ImportOrder[]

    //@ApiProperty({type: () => [Order]})
    @OneToMany(() => Order, (o) => o.agent)
    orders!: Order[]
}