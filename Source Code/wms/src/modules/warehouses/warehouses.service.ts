import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Warehouse } from './entities/warehouse.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateWarehouseEmployeeDto } from './dto/create-warehouse-employee.dto';
import { WarehouseEmployee } from './entities/warehouse-employee.entity';
import { CreateWarehouseProductBatchDto } from './dto/create-warehoue-product-batch.dto';
import { WarehouseProductBatch } from './entities/warehouse-product-batch.entity';
import { Product } from '../products/entities/product.entity';
import { WarehouseProduct } from './entities/warehouse-product.entity';
import { ExportOrderItem } from '../export-orders/entities/export-order-item.entity';
import { UpdateWarehouseProductBatchDto } from './dto/update-warehouse-product-batch.dto';
import { InventoryHistory, InventoryHistoryStatus } from '../inventory-histories/entities/inventory-history.entity';
import { DeleteWarehouseProductDto } from './dto/delete-warehouse-product.dto';
import { DeleteWarehouseEmployeeDto } from './dto/delete-warehouse-employee.dto';
import { CreateWarehouseProductDto } from './dto/create-warehouse-product.dto';
import { getDataFromDTO } from '../../utilities/functions/getDataFromDTO';
import { removeNullAndUndefined } from '../../utilities/functions/removeNullAndUndefined';
import { User } from '../users/entities/user.entity';

@Injectable()
export class WarehousesService {
  constructor(
    private dataSource: DataSource,

    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,

    @InjectRepository(WarehouseEmployee)
    private warehouseEmployeeRepository: Repository<WarehouseEmployee>,

    @InjectRepository(WarehouseProduct)
    private warehouseProductRepository: Repository<WarehouseProduct>,

    @InjectRepository(WarehouseProductBatch)
    private warehouseProductBatchRepository: Repository<WarehouseProductBatch>,
  ){}

  create(createWarehouseDto: CreateWarehouseDto) {
    const warehouse = new Warehouse();
    getDataFromDTO(warehouse, createWarehouseDto);

    return this.warehouseRepository.save(warehouse!);
  }

  createWarehouseProduct(createWarehouseProductDto: CreateWarehouseProductDto){
    const warehouseProduct = new CreateWarehouseProductDto();

    warehouseProduct.warehouseId = createWarehouseProductDto.warehouseId;
    warehouseProduct.productId = createWarehouseProductDto.productId;

    return this.warehouseProductRepository.save(warehouseProduct);
  }

  createWarehouseProductsByListEntity(listWarehouseProduct: WarehouseProduct[]){
    return this.warehouseProductRepository.save(listWarehouseProduct);
  }

  createProductBatch(createWarehouseProductBatchDto: CreateWarehouseProductBatchDto){
    const warehouseProductBatch = new WarehouseProductBatch();
    getDataFromDTO(warehouseProductBatch, createWarehouseProductBatchDto);
    
    return this.warehouseProductBatchRepository.save(warehouseProductBatch);
  }

  createProductBatchsByListEntity(listWarehouseProductBatch: WarehouseProductBatch[]){
    return this.warehouseProductBatchRepository.save(listWarehouseProductBatch);
  }

  createWarehouseEmployee(createWarehouseEmployeeDto: CreateWarehouseEmployeeDto){
    const listWarehouseEmployee : WarehouseEmployee[] = [];
    
    createWarehouseEmployeeDto.listEmployeeId.forEach((employeeId) => {
      const warehouseEmployee = new WarehouseEmployee();
      warehouseEmployee.warehouseId = createWarehouseEmployeeDto.warehouseId;
      warehouseEmployee.employeeId = employeeId;

      listWarehouseEmployee.push(warehouseEmployee);
    });

    return this.warehouseEmployeeRepository.save(listWarehouseEmployee);
  }

  find(limit: number, offset: number) {
    return this.warehouseRepository.find({take: limit, skip: offset, order: {id: 'ASC'}});
  }

  async findOne(id: string) {
    const warehouse = await this.warehouseRepository.findOneBy({id: id});

    if(warehouse == null){
      throw new NotFoundException('Warehouse not found');
    } else{
      return warehouse;
    }
  }

  findWarehouseProductBatchs(warehouseId: string){
    return this.warehouseProductBatchRepository.findBy({warehouseId: warehouseId});
  }

  async findOneWarehouseProductBatch(id: string){
    const warehouseProductBatch = await this.warehouseProductBatchRepository.findOneBy({id: id});
    
    if(warehouseProductBatch == null){
      throw new NotFoundException('WarehouseProductBatch not found');
    } else{
      return warehouseProductBatch;
    }
  }

  async findWarehouseProductBatchsByProductName(keyword: string, warehouseId: string, limit: number, offset: number){
    return await this.warehouseProductRepository.createQueryBuilder('warehouseProduct')
                                                .innerJoinAndMapMany('warehouseProduct.listWarehouseProductBatch', WarehouseProductBatch, 'warehouseProductBatch', 'warehouseProduct.productId = warehouseProductBatch.productId AND warehouseProduct.warehouseId = warehouseProductBatch.warehouseId')
                                                .innerJoinAndMapOne('warehouseProduct.product', Product, 'product', 'warehouseProduct.productId = product.id')
                                                .where(`product.name ILIKE '%${keyword}%'`)
                                                .andWhere(`warehousProduct.warehouseId = ${warehouseId}`)
                                                .limit(limit)
                                                .offset(offset)
                                                .execute();
  }

  findOneWarehouseProductBatchByExportOrderItem(exportOrderItemId: string){
    return this.warehouseProductBatchRepository.createQueryBuilder('warehouseProductBatch')
                                                .innerJoin(ExportOrderItem, 'exportOrderItem', 'warehouseProductBatch.id = exportOrderItem.warehouseProductBatchId')
                                                .where(`exportOrderItem.id = ${exportOrderItemId}`)
                                                .getOne();
  }

  findWarehouseProductBatchsByListDto(listProductBatchId: string[]){
    return this.warehouseProductBatchRepository.createQueryBuilder().whereInIds(listProductBatchId).getMany();
  }

  findWarehouseProductBatchsByProductForExport(productId: string, warehouseId: string, currentTimeStamp: number, orderByExpiredAt: boolean, orderByStock: boolean, getProductData: boolean){
    const query = this.warehouseProductBatchRepository.createQueryBuilder('warehouseProductBatch')
                                               .where(`warehouseProductBatch.productId = ${productId}`)
                                               .andWhere(`warehouseProductBatch.warehouseId = ${warehouseId}`)
                                               //.andWhere(`warehouseProductbatch.expiredAt > ${currentTimeStamp}`)
                                               .orderBy("warehouseProductBatch.expiredAt", orderByExpiredAt == true ? "ASC" : "DESC")
                                               .addOrderBy("warehouseProductBatch.stock", orderByStock == true ? "ASC" : "DESC");
    if(getProductData == true){
      query.innerJoinAndMapMany('warehouseProductBatch.product', Product, 'product', 'warehouseProductBatch.productId = product.id');
    }

    return query.getMany();
  }

  async findWarehouseProductBatchsByIds(listIds: string[]){
    const listWarehouseProductBatch = await this.warehouseProductBatchRepository.createQueryBuilder('warehouseProductBatch')
                                                                                .whereInIds(listIds)
                                                                                .getMany();

    if(listWarehouseProductBatch.length != listIds.length){
      throw new NotFoundException('WarehouseProductBatch not found');
    } else {
      return listWarehouseProductBatch;
    }
  }

  async findEmployeeForAdmin(employeeId: string){
    const queryResult =  await this.warehouseRepository
                                    .createQueryBuilder('warehouse')
                                    .where({id: employeeId})
                                    .innerJoinAndMapMany('warehouse.warehouseEmployees', WarehouseEmployee, 'wE')
                                    .innerJoinAndMapMany('warehouse.listEmployee', User, 'user')
                                    .getOne();
    
    const result = removeNullAndUndefined(queryResult!);
    
    return result;
  }

  findWarehouseEmployeeByEmployee(employeeId: string){
    return this.warehouseEmployeeRepository.findOneBy({employeeId: employeeId});
  }

  async findOneWarehouseEmployee(employeeId: string){
    const warehouseEmployee = await this.warehouseEmployeeRepository.findOneBy({employeeId: employeeId});
    
    if(warehouseEmployee == null){
      throw new NotFoundException("Khong tim thay nhan vien");
    } else {
      return warehouseEmployee;
    }
  }

  async update(id: string, updateWarehouseDto: UpdateWarehouseDto) {
    const warehouse = await this.findOne(id);
    getDataFromDTO(warehouse, updateWarehouseDto);

    return this.warehouseRepository.save(warehouse!);
  }

  // Cap nhat, luu lich su chinh sua
  async updateWarehouseProductBatch(productBatchId: string, managerId: string, updateWarehouseProductBatchDto : UpdateWarehouseProductBatchDto){
    if(updateWarehouseProductBatchDto.stock < 0){
      throw new BadRequestException();
    } else if (updateWarehouseProductBatchDto.stock == null || updateWarehouseProductBatchDto.stock == undefined){
      const warehouseProductBatch = await this.findOneWarehouseProductBatch(productBatchId);
      getDataFromDTO(warehouseProductBatch, removeNullAndUndefined(updateWarehouseProductBatchDto));

      return this.warehouseProductBatchRepository.save(warehouseProductBatch!);
    } else {
      const warehouseEmployee = await this.findOneWarehouseEmployee(managerId);
      const warehouseProductBatch = await this.warehouseProductBatchRepository.findOneBy({id: productBatchId});
      
      if (warehouseProductBatch == null) {
        throw new NotFoundException("Khong tim thay lo hang");
      } else if (warehouseEmployee!.warehouseId != warehouseProductBatch.warehouseId){
        throw new ConflictException();
      } else if (warehouseProductBatch.availableStock - (warehouseProductBatch.stock - updateWarehouseProductBatchDto.stock) < 0){
        throw new ConflictException("Xung dot lam am availableStock")
      } else {
        const inventoryHistory = new InventoryHistory();

        inventoryHistory.managerId = managerId;
        inventoryHistory.status = InventoryHistoryStatus.MODIFIED;
        inventoryHistory.lastStock = warehouseProductBatch!.stock;
        inventoryHistory.updatedStock = updateWarehouseProductBatchDto.stock;
        inventoryHistory.warehouseProductBatchId = warehouseProductBatch!.id;

        warehouseProductBatch.availableStock = warehouseProductBatch.availableStock - (warehouseProductBatch.stock - updateWarehouseProductBatchDto.stock);
        getDataFromDTO(warehouseProductBatch, updateWarehouseProductBatchDto, false);
        
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        
        try{
          await queryRunner.manager.save(inventoryHistory);
          const savedWarehouseProductBatch = await queryRunner.manager.save(warehouseProductBatch);
          await queryRunner.commitTransaction();

          return savedWarehouseProductBatch;
        } catch (error){
          console.log(error);
          await queryRunner.rollbackTransaction();
          throw new InternalServerErrorException();
        } finally {
          await queryRunner.release();
        } 
      }
    }
  }

  updateWarehouseProductBatchsByListEntity(listWarehouseProductBatch: WarehouseProductBatch[]){
    return this.warehouseProductBatchRepository.save(listWarehouseProductBatch);
  }

  async deleteWarehouseEmployee(deleteWarehouseEmployeeDto: DeleteWarehouseEmployeeDto){
    const warehouseEmployee = await this.warehouseEmployeeRepository.findOneBy({employeeId: deleteWarehouseEmployeeDto.employeeId, warehouseId: deleteWarehouseEmployeeDto.warehouseId});
    
    if(warehouseEmployee == null){
      throw new NotFoundException('WarehouseEmployee not found')
    } else {
      return this.warehouseEmployeeRepository.delete(warehouseEmployee);
    }
  }

  async deleteWarehouseProduct(deleteWarehouseProductDto: DeleteWarehouseProductDto){
    const warehouseProduct = await this.warehouseProductRepository.findOneBy({productId: deleteWarehouseProductDto.productId, warehouseId: deleteWarehouseProductDto.warehouseId});
    
    if(warehouseProduct == null){
      throw new NotFoundException('WarehouseProduct not found')
    } else {
      return this.warehouseProductRepository.delete(warehouseProduct);
    }
  }
}