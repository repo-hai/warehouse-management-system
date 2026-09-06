
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from "typeorm";
import { ProductCategory } from "../../products/entities/product-category.entitiy";

@Entity()
export class Category {
    @ApiProperty()
    @PrimaryGeneratedColumn({type: "bigint"})
    id!: string;

    @ApiProperty()
    @Column({type: "varchar", length: 100})
    @Index("Category name")
    name!: string;

    @ApiPropertyOptional()
    @Column({type: "varchar", length: 100, nullable: true})
    description?: string;

    @ApiProperty()
    @CreateDateColumn()
    createdAt!: Date;

    @ApiProperty()
    @UpdateDateColumn()
    updatedAt!: Date;

    @OneToMany(() => ProductCategory, (ProductCategory) => ProductCategory.category)
    listProductCategory!: ProductCategory[]
}