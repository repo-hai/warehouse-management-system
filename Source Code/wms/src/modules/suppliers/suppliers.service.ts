import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { ImportOrder } from '../import-orders/entities/import-order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getDataFromDTO } from '../../utilities/functions/getDataFromDTO';
import { Supplier } from './entities/supplier.entity';

@Injectable()
export class suppliersService {
  constructor(
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
  ){}

  create(createSupplierDto: CreateSupplierDto) {
    const supplier = new Supplier();
    getDataFromDTO(supplier, createSupplierDto);

    return this.supplierRepository.save(supplier);
  }

  find(limit: number, offset: number){
    return this.supplierRepository.find({take: limit, skip: offset});
  }

  findBySupplierName(keyword: string, limit: number, offset: number){
    return this.supplierRepository.createQueryBuilder('supplier')
                                  .limit(limit)
                                  .offset(offset)
                                  .where(`supplier.name ILIKE '%${keyword}%'`)
                                  .orderBy('supplier.id', 'ASC')
                                  .getMany();
  }

  findRecentlyImportedSuppliers(warehouseId: string, limit: number, offset: number){  
    return this.supplierRepository.createQueryBuilder('supplier')
                                  .innerJoin(ImportOrder, 'importOrder', 'importOrder.supplierId = supplier.id')
                                  .where(`importOrder.warehouseId = ${warehouseId}`)
                                  .addSelect('MAX(importOrder.importDate) AS lastUsed')
                                  .groupBy('supplier.id')
                                  .orderBy('lastUsed', 'DESC')
                                  .limit(limit)
                                  .offset(offset)
                                  .getMany();
  }

  async findOne(id: string) {
    const supplier = await this.supplierRepository.findOneBy({id: id});

    if(supplier == null){
      throw new NotFoundException('Supplier not found');
    } else {
      return supplier;
    }
  }

  async update(id: string, updateSupplierDto: UpdateSupplierDto) {
    const supplier = await this.findOne(id);
    getDataFromDTO(supplier, updateSupplierDto);

    return this.supplierRepository.save(supplier!);
  }
}
