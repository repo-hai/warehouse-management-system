import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateImportOrderDto } from './dto/create-import-order.dto';
import { UpdateImportOrderDto } from './dto/update-import-order.dto';
import { ImportOrder, ImportOrderStatus } from './entities/import-order.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ImportOrderItem } from './entities/import-order-item.entity';
import { DataSource } from 'typeorm/data-source/DataSource';
import { WarehousesService } from '../warehouses/warehouses.service';
import { Product } from '../products/entities/product.entity';
import { InventoryHistoriesService } from '../inventory-histories/inventory-histories.service';
import { ProductsService } from '../products/products.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { getDataFromDTO } from '../../utilities/functions/getDataFromDTO';
import { InventoryHistory, InventoryHistoryStatus } from '../inventory-histories/entities/inventory-history.entity';
import { WarehouseProductBatch } from '../warehouses/entities/warehouse-product-batch.entity';
import { WarehouseProduct } from '../warehouses/entities/warehouse-product.entity';

@Injectable()
export class ImportOrdersService {
  constructor(
    private dataSource: DataSource,

    @InjectRepository(ImportOrder)
    private importOrderRepository: Repository<ImportOrder>,

    @InjectRepository(ImportOrderItem)
    private importOrderItemRepository: Repository<ImportOrderItem>,

    private inventoryHistoriesService: InventoryHistoriesService,
    
    private warehousesService: WarehousesService,

    private productsService: ProductsService,

    @InjectQueue('importSuccessfulEmailQueue')
    private successImportEmailQueue: Queue,
  ){}

  // Tạo đơn nhập kho mới
  // Chi tiết:
  //    Tạo đơn nhập kho -> Tạo lô hàng trong đơn -> Tạo lịch sử biến động, status: processing -> Lưu (có sử dụng transaction)
  async create(createImportOrderDto: CreateImportOrderDto) {
    const warehouseEmployee = await this.warehousesService.findOneWarehouseEmployee(createImportOrderDto.warehouseStaffId!);
    if(warehouseEmployee!.warehouseId != createImportOrderDto.warehouseId) {
      throw new ConflictException();
    } else {
      // Nap du lieu cho entity
      const importOrder = new ImportOrder();
      getDataFromDTO(importOrder, createImportOrderDto, true);
      importOrder.status = ImportOrderStatus.IMPORTING;

      // Tao danh sach ImportOrderItem
      const listProductId : string[] = [];
      createImportOrderDto.listImportOrderItemDto.forEach((importOrderItemDto) => {
        listProductId.push(importOrderItemDto.productId);
      });
      // Kiem tra san pham co ton tai trong he thong hay khong
      const isExisting = await this.productsService.existByListId(listProductId);

      if(isExisting == true){
        // Khoi tao transaction
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try{
          // Luu don nhap kho moi
          const savedImportOrder = await queryRunner.manager.save(importOrder);
          
          // Tao lo hang moi - WarehouseProductBatch
          // Luu item - luu importOrderItem
          const listImportOrderItem: ImportOrderItem[] = [];

          createImportOrderDto.listImportOrderItemDto.forEach((importOrderItemDto) => {
            const importOrderItem = new ImportOrderItem();
            getDataFromDTO(importOrderItem, importOrderItemDto, true);
            importOrderItem.warehouseId = createImportOrderDto.warehouseId;
            importOrderItem.importOrderId = savedImportOrder.id;

            listImportOrderItem.push(importOrderItem);
          });

          const listSavedImportOrderItem = await queryRunner.manager.save(listImportOrderItem);

          const listInventoryHistory : InventoryHistory[] = [];

          listSavedImportOrderItem.forEach(async (savedImportOrderItem) => {
            // Luu lich su bien dong kho - InventoryHistory
            const inventoryHistory = new InventoryHistory();
            inventoryHistory.lastStock = 0;
            inventoryHistory.updatedStock = savedImportOrderItem.quantity;
            inventoryHistory.status = InventoryHistoryStatus.IMPORTING;
            inventoryHistory.warehouseStaffId = createImportOrderDto.warehouseStaffId;
            inventoryHistory.importOrderItemId = savedImportOrderItem!.id;
            
            listInventoryHistory.push(inventoryHistory);
          });

          await queryRunner.manager.save(listInventoryHistory);

          await queryRunner.commitTransaction();

          savedImportOrder.listImportOrderItem = listSavedImportOrderItem;
          return savedImportOrder;
        } catch (error){
          console.log(error);
          await queryRunner.rollbackTransaction();
          throw new InternalServerErrorException();
        } finally {
          await queryRunner.release();
        }
      } else {
        throw new NotFoundException('Products not found');
      }
    }
  }

  createImportOrderByEntity(importOrder: ImportOrder){
    return this.importOrderRepository.save(importOrder);
  }

  createImportOrderItemByEntity(importOrderItem: ImportOrderItem){
    return this.importOrderItemRepository.save(importOrderItem);
  }

  find(listWarehouseId: string[], listStatus: string[], sortBy: string[], orders: number[], limit: number, offset: number) {
    const query = this.importOrderRepository.createQueryBuilder('importOrder')
                                            .where(`importOrder.warehouseId IN (${listWarehouseId})`)

    if(listStatus != null && listStatus.length != 0){
      let s = '';
      listStatus.forEach((status, idx) => {
        if(idx + 1 != listStatus.length){
          s += `'${status}'` + ',';
        } else {
          s += `'${status}'`;
        }
      });
      query.andWhere(`importOrder.status IN (${s})`)
    }

    if(sortBy != null){
    sortBy.forEach((key, idx) => {
        query.addOrderBy(`importOrder.${key}`, orders[idx] == 1 ? "ASC" : "DESC")
      });
    }

    return query.innerJoinAndMapMany('importOrder.listImportOrderItem', ImportOrderItem, 'importOrderItem', 'importOrder.id = importOrderItem.importOrderId')
                .limit(limit)
                .offset(offset)
                .getMany();
  }

  async findOne(id: string){
    const importOrder = await this.importOrderRepository.findOneBy({id: id});
    if(importOrder == null){
      throw new NotFoundException('ImportOrder not found');
    } else {
      return this.importOrderRepository.createQueryBuilder('importOrder')
                                        .where(`importOrder.id = ${id}`)
                                        .innerJoinAndMapMany('importOrder.listImportOrderItem', ImportOrderItem, 'importOrderItem', 'importOrder.id = importOrderItem.importOrderId')
                                        .getOne();
    }
  }

  findOneImportOrderItem(id: string){
    return this.importOrderItemRepository.findOneBy({id: id});
  }

  async findImportOrderItemByImportOrder(importOrderId: string){
    return this.importOrderItemRepository.createQueryBuilder('importOrderItem')
                                                .innerJoin(ImportOrder, 'importOrder', 'importOrder.id = importOrderItem.importOrderId')
                                                .innerJoinAndMapOne('importOrderItem.product', Product, 'product', 'product.id = importOrderItem.productId')
                                                .where(`importOrder.id = ${importOrderId}`)
                                                .getMany();
  }

  async findWarehouseOfImportOrder(importOrderID: string){
    const importOrder = await this.importOrderRepository.findOneBy({id: importOrderID});
    
    if(importOrder == null){
      return null;
    } else {
      return importOrder!.warehouseId;
    }
  }

  // Nhan vien kho cap nhat don, chi cho phep sua khi don chua duoc quan ly duyet
  // Xoa lich su cu, tao lich su moi
  // Xoa item cu, tao item moi
  async updateByWarehouseStaff(importOrderId: string, updateImportOrderDto: UpdateImportOrderDto){
    const warehouseEmployee = await this.warehousesService.findOneWarehouseEmployee(updateImportOrderDto.warehouseStaffId!);
    const importOrder = await this.findOne(importOrderId);

    if (warehouseEmployee!.warehouseId != importOrder!.warehouseId){
      throw new ConflictException();
    } else if (importOrder!.status == ImportOrderStatus.IMPORT_APPROVED){
      throw new ConflictException("Nhan vien khong duoc sua don da nhap kho");
    } else {
      importOrder!.status = ImportOrderStatus.MODIFIED;
      
      const listOldImportOrderItem = await this.importOrderItemRepository.findBy({importOrderId: importOrderId});
      const listOldInventoryHistory = await this.inventoryHistoriesService.findProcessingHistoryByImportOrderItems(listOldImportOrderItem);

      const listNewImportOrderItem : ImportOrderItem[] = [];
      const listProductId : string[] = [];

      updateImportOrderDto.listUpdateImportOrderItemDto.forEach((updateImportOrderItemdto) => {
        const importOrderItem = new ImportOrderItem();

        importOrderItem.expiredAt = new Date(updateImportOrderItemdto.expiredAt);
        importOrderItem.importOrderId = importOrderId;
        importOrderItem.quantity = updateImportOrderItemdto.quantity;
        importOrderItem.productId = updateImportOrderItemdto.productId;
        importOrderItem.unit = updateImportOrderItemdto.unit;

        listNewImportOrderItem.push(importOrderItem);
        listProductId.push(updateImportOrderItemdto.productId);
      });

      const isExisting = await this.productsService.existByListId(listProductId);

      if(isExisting == true){
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try{
          const savedImportOrder = await queryRunner.manager.save(importOrder!);
          await queryRunner.manager.remove(listOldInventoryHistory);
          // await queryRunner.manager.createQueryBuilder().delete().from(ImportOrderItem, 'importOrderItem').where(`importOrderItem.importOrderId = ${importOrderId}`).execute();
          await queryRunner.manager.remove(listOldImportOrderItem);
          const listSavedImportOrderItem = await queryRunner.manager.save(listNewImportOrderItem);

          const listNewInventoryHistory : InventoryHistory[] = [];

          listSavedImportOrderItem.forEach((savedImportOrderItem) => {
            const inventoryHistory = new InventoryHistory();
            inventoryHistory.description = savedImportOrderItem.description;
            inventoryHistory.importOrderItem = savedImportOrderItem;
            inventoryHistory.lastStock = 0;
            inventoryHistory.status = InventoryHistoryStatus.IMPORTING;
            inventoryHistory.updatedStock = savedImportOrderItem.quantity;
            inventoryHistory.warehouseStaffId = importOrder!.warehouseStaffId;

            listNewInventoryHistory.push(inventoryHistory);
          });

          await queryRunner.manager.save(listNewInventoryHistory);

          await queryRunner.commitTransaction();
          
          return savedImportOrder;
        } catch(error){
          console.log(error);
          queryRunner.rollbackTransaction();
          throw new InternalServerErrorException();
        } finally {
          queryRunner.release();
        }
      } else {
        throw new ConflictException('Products not found');
      }
    }
  }

  // Tác vụ: Quản lý xác nhận đơn nhập kho.
  // Mục tiêu: 
  //    Thêm lô sản phẩm vào WarehouseProductBatch.
  //    Lưu lịch sử biến động kho.
  // Transaction: [Cập nhật số lượng bằng cách thêm vào warehouseProductBatch && lưu lịch sử biến động kho]
  // Chi tiết:
  //    Lấy importOrder, warehouse, ds importOrderItem, ds inventoryHistory.
  //    Tạo ds inventoryHistory mới để create.
  //    Lấy ds warehouseProduct bằng cách lưu nếu chưa có vào bảng WarehouseProduct.
  //    Tạo ds warehouseProductBatch để create.
  //    Thực hiện lưu.
  async approveByManager(importOrderId: string, managerId: string){
    const warehouseEmployee = await this.warehousesService.findOneWarehouseEmployee(managerId!);
    const importOrder = await this.findOne(importOrderId);

    if (warehouseEmployee!.warehouseId != importOrder!.warehouseId){
      throw new ConflictException();
    } else if (importOrder!.status == ImportOrderStatus.IMPORT_APPROVED){
      throw new ConflictException("Quan ly khong duoc sua don da nhap kho");
    } else {
      const importOrder = await this.findOne(importOrderId);

      const listImportOrderItem = await this.findImportOrderItemByImportOrder(importOrderId);
      //const listInventoryHistory = await this.inventoryHistoriesService.findProcessingHistoryByImportOrderItems(listImportOrderItem);
      
      const listWarehouseProductBatch: WarehouseProductBatch[] = [];
      // Get list product
      const listWarehouseProduct: WarehouseProduct[] = [];
      listImportOrderItem.forEach((importOrderItem) => {
        const warehoueProduct = new WarehouseProduct();

        warehoueProduct.productId = importOrderItem.productId;
        warehoueProduct.warehouseId = importOrder!.warehouseId;

        listWarehouseProduct.push(warehoueProduct);
      });

      // Khoi tao transaction
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      
      try{
        importOrder!.managerId = managerId;
        importOrder!.status = ImportOrderStatus.IMPORT_APPROVED;
        const savedImportOrder = await queryRunner.manager.save(importOrder!);

        // Create list warehoueProduct if not existing
        const listCreatedWarehouseProduct = await queryRunner.manager.save(listWarehouseProduct);

        listCreatedWarehouseProduct.forEach(async (createdWarehouseProduct, idx) => {
          const warehouseProductBatch = new WarehouseProductBatch();

          warehouseProductBatch.productId = createdWarehouseProduct.productId;
          warehouseProductBatch.warehouseId = createdWarehouseProduct.warehouseId;
          warehouseProductBatch.stock = listImportOrderItem[idx].quantity;
          warehouseProductBatch.availableStock = listImportOrderItem[idx].quantity;
          warehouseProductBatch.expiredAt = listImportOrderItem[idx].expiredAt;
          warehouseProductBatch.unit = listImportOrderItem[idx].unit;
          warehouseProductBatch.importOrderItem = listImportOrderItem[idx];
          
          listWarehouseProductBatch.push(warehouseProductBatch);
        });

        // Create rows in WarehouseProductBatch table
        const listCreatedWarehouseProductBatch = await queryRunner.manager.save(listWarehouseProductBatch);

        const listNewInventoryHistory: InventoryHistory[] = [];
        listImportOrderItem.forEach((importOrderItem, idx) => {
          const newInventoryHistory = new InventoryHistory();
          
          newInventoryHistory.lastStock = 0;
          newInventoryHistory.updatedStock = importOrderItem.quantity;
          newInventoryHistory.status = InventoryHistoryStatus.APPROVED_IMPORT;
          newInventoryHistory.warehouseStaffId = importOrder!.warehouseStaffId;
          newInventoryHistory.managerId = managerId;
          newInventoryHistory.importOrderItemId = importOrderItem.id;
          newInventoryHistory.warehouseProductBatchId = listCreatedWarehouseProductBatch[idx].id;

          listNewInventoryHistory.push(newInventoryHistory);
        });
        // console.log(listNewInventoryHistory);
        await queryRunner.manager.save(listNewInventoryHistory);
        // console.log(listCreatedInventoryHistory);
        await queryRunner.commitTransaction();

        // Add send email task to Queue
        importOrder!.listImportOrderItem = listImportOrderItem; 
        this.successImportEmailQueue.add('sendSuccessImportEmail', importOrder);
        
        return savedImportOrder;
      } catch (error){
        console.log(error);
        await queryRunner.rollbackTransaction();
        throw new InternalServerErrorException();
      } finally {
        await queryRunner.release();
      }
    }
  }

  // async testEmail(){
  //   return await this.successImportEmailQueue.add('sendImportSuccessfulEmail', {
  //     'text': 'Import successfully'
  //   });
  // }

  // Chỉ cho phép xóa đơn nhập kho khi status != Import_Approved
  // Xóa đơn 
  async removeByWarewhouseStaff(importOrderId: string, warehouseStaffId: string) {
    const warehouseEmployee = await this.warehousesService.findOneWarehouseEmployee(warehouseStaffId);
    const importOrder = await this.findOne(importOrderId);

    if (importOrder!.warehouseId != warehouseEmployee.warehouseId){
      throw new ConflictException("Nhan vien khong thuoc kho nay");
    } else if (importOrder!.status == ImportOrderStatus.IMPORT_APPROVED) {
      throw new ConflictException("Khong duoc xoa don da nhap kho");
    } else {
      const listImportOrderItem = await this.findImportOrderItemByImportOrder(importOrderId);

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      
      try{
        await queryRunner.manager.remove(listImportOrderItem);
        const savedImportOrder = await queryRunner.manager.remove(importOrder!);
        await queryRunner.commitTransaction();

        return savedImportOrder;
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
