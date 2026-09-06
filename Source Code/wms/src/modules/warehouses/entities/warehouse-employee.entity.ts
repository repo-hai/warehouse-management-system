import { Entity, Index, JoinColumn, ManyToOne, PrimaryColumn, Unique} from "typeorm";
import { Warehouse } from "./warehouse.entity";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "../../users/entities/user.entity";

@Entity()
export class WarehouseEmployee {
    @ApiProperty()
    @PrimaryColumn()
    @Index("WarehouseEmployee warehouseId")
    warehouseId!: string 

    @ApiProperty()
    @PrimaryColumn()
    @Index("WarehouseEmployee employeeId")
    employeeId!: string

    @ApiProperty({type: () => Warehouse})
    @ManyToOne(() => Warehouse)
    @JoinColumn()
    warehouse!: Warehouse

    @ApiProperty({type: () => User})
    @ManyToOne(() => User)
    @JoinColumn()
    employee!: User
}