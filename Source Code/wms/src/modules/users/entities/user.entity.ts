import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ExportOrder } from '../../export-orders/entities/export-order.entity';
import { ImportOrder } from '../../import-orders/entities/import-order.entity';
import { InventoryHistory } from '../../inventory-histories/entities/inventory-history.entity';
import { WarehouseEmployee } from '../../warehouses/entities/warehouse-employee.entity';

export enum UserRole {
    ADMIN = "admin",
    STAFF = "staff",
    MANAGER = "manager",
}

@Entity()
@Index("USER COMPOSITE INDEX username, password", ["username", "password"])
export class User {
    @ApiProperty()
    @PrimaryGeneratedColumn({type: "bigint"})
    id!: string;

    @ApiProperty()
    @Column({type: "varchar", length: 20})
    @Index("USER name")
    name!: string;

    @ApiProperty()
    @Column({type: "varchar", length: 20})
    username!: string;

    @ApiProperty()
    @Column({type: "varchar", length: 20})
    password!: string;

    @ApiProperty()
    @Column({type: "varchar", length: 13, nullable: true})
    phoneNumber!: string;

    @ApiProperty({enum: UserRole, enumName: 'UserRole'})
    @Column({type: "enum", enum: UserRole})
    @Index("USER role")
    role!: UserRole;

    @ApiProperty()
    @CreateDateColumn({type: "timestamp"})
    createdAt!: Date;

    @ApiProperty()
    @UpdateDateColumn({type: "timestamp"})
    updatedAt!: Date;

    //@ApiProperty({type: () => [WarehouseEmployee]})
    @OneToMany(() => WarehouseEmployee, (WarehouseEmployee) => WarehouseEmployee.employee)
    warehouseEmployees!: WarehouseEmployee[]

    //@ApiProperty({type: () => [ImportOrder]})
    @OneToMany(() => ImportOrder, (ImportOrder) => ImportOrder.warehouseStaff)
    importOrdersByStaff!: ImportOrder[]
    
    //@ApiProperty({type: () => [ImportOrder]})
    @OneToMany(() => ImportOrder, (ImportOrder) => ImportOrder.manager)
    importOrdersByManagers!: ImportOrder[]

    //@ApiProperty({type: () => [ExportOrder]})
    @OneToMany(() => ExportOrder, (ExportOrder) => ExportOrder.warehouseStaff)
    exportOrdersByStaff!: ExportOrder[]

    //@ApiProperty({type: () => [ExportOrder]})
    @OneToMany(() => ExportOrder, (ExportOrder) => ExportOrder.manager)
    exportOrdersByManager!: ExportOrder[]

    //@ApiProperty({type: () => [InventoryHistory]})
    @OneToMany(() => InventoryHistory, (InventoryHistory) => InventoryHistory.warehouseStaff)
    inventoryHistoriesByStaff!: InventoryHistory[]

    //@ApiProperty({type: () => [InventoryHistory]})
    @OneToMany(() => InventoryHistory, (InventoryHistory) => InventoryHistory.manager)
    inventoryHistoriesByManager!: InventoryHistory[]
}
