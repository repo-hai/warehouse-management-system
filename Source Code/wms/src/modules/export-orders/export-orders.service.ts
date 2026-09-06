import { Injectable, ConflictException, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { getDataFromDTO } from "../../utilities/functions/getDataFromDTO";
import { InventoryHistory, InventoryHistoryStatus } from "../inventory-histories/entities/inventory-history.entity";
import { InventoryHistoriesService } from "../inventory-histories/inventory-histories.service";
import { Order } from "../orders/entities/order.entity";
import { WarehouseProductBatch } from "../warehouses/entities/warehouse-product-batch.entity";
import { WarehousesService } from "../warehouses/warehouses.service";
import { CreateExportOrderDto } from "./dto/create-export-order.dto";
import { UpdateExportOrderByManagerDto } from "./dto/update-export-order-by-manager.dto";
import { UpdateExportOrderDto } from "./dto/update-export-order.dto";
import { ExportOrderItem } from "./entities/export-order-item.entity";
import { ExportOrder, ExportOrderStatus } from "./entities/export-order.entity";

@Injectable()
export class ExportOrdersService {
  constructor(
    private dataSource: DataSource,

    @InjectRepository(ExportOrder)
    private readonly exportOrderRepository: Repository<ExportOrder>,

    @InjectRepository(ExportOrderItem)
    private readonly exportOrderItemRepository: Repository<ExportOrderItem>, 

    private warehousesService: WarehousesService,

    private inventoryhistoriesService: InventoryHistoriesService,
  ){}

  async create(createExportOrderDto: CreateExportOrderDto) {
    const warehouseEmployee = await this.warehousesService.findOneWarehouseEmployee(createExportOrderDto.warehouseStaffId);
    if (warehouseEmployee.warehouseId != createExportOrderDto.warehouseId){
      throw new ConflictException("Nhan vien khong thuoc kho nay");
    } else {

      // Kiem tra
      for(const exportOrderItem of createExportOrderDto.listExportOrderItemDto) {
        if(exportOrderItem.quantity != undefined 
          && exportOrderItem.listWarehouseProductBatchDto != undefined 
          && exportOrderItem.listWarehouseProductBatchDto.length != 0
        ){
          throw new ConflictException("Have both quantity and listWarehouseProductBatch");
        } else if(exportOrderItem.quantity == 0){
          throw new ConflictException("quantity = 0");
        }
      }

      // Tao don xuat kho
      const exportOrder = new ExportOrder();
      const listInventoryHistory : InventoryHistory[] = [];
      const listExportOrderItem : ExportOrderItem[] = [];
      let listProductBatch : WarehouseProductBatch[] = [];

      // Lay batch tuong ung
      // Moi ExportOrderItem trong ExportOrder co du thong tin: ds productBatch
      // Lay du danh sach product batch dua tren danh sach item trong dto
      for(const itemDto of createExportOrderDto.listExportOrderItemDto){
        if(itemDto.listWarehouseProductBatchDto != undefined && itemDto.listWarehouseProductBatchDto != null && itemDto.listWarehouseProductBatchDto.length != 0){
          // Truong hop nhan vien da chi dinh danh sach lo hang can xuat: Lay danh sach san pham len
          const listIds : string[] = [];
          itemDto.listWarehouseProductBatchDto.forEach((WPBdto) => {
            listIds.push(WPBdto.id);
          });

          // Da bao gom kiem tra ton tai trong ham findWarehouseProductBatchByIds
          listProductBatch = await this.warehousesService.findWarehouseProductBatchsByIds(listIds);
          
          for(const idx in listProductBatch){
            const productBatch = listProductBatch[idx];
            if(productBatch.availableStock >= itemDto.listWarehouseProductBatchDto[idx].quantity){
              const inventoryHistory = new InventoryHistory();
              inventoryHistory.lastStock = productBatch.availableStock;
              inventoryHistory.updatedStock = productBatch.availableStock - itemDto.listWarehouseProductBatchDto[idx].quantity;
              inventoryHistory.warehouseProductBatch = productBatch;

              listInventoryHistory.push(inventoryHistory);

              const exportOrderItem = new ExportOrderItem();
              exportOrderItem.productId = productBatch.productId;
              exportOrderItem.warehouseId = productBatch.warehouseId;
              exportOrderItem.quantity = itemDto.listWarehouseProductBatchDto[idx].quantity;
              exportOrderItem.warehouseProductBatch = productBatch;
              
              listExportOrderItem.push(exportOrderItem);

              productBatch.availableStock -= itemDto.listWarehouseProductBatchDto[idx].quantity;
            } else {
              throw new ConflictException("So luong khong hop le");
            }
          }
        } else{
          // Truong hop nhan vien chi dua ra so luong --> HT tu dong lay san pham theo ngay het han gan nhat de xuat kho
          // Lay danh sach productbatch len --> chon
          let quantity = itemDto.quantity;
          
          listProductBatch = await this.warehousesService.findWarehouseProductBatchsByProductForExport(itemDto.productId, createExportOrderDto.warehouseId, createExportOrderDto.currentTimeStamp, true, false, false);
          let sum = 0;
          
          listProductBatch.forEach((productBatch) => {
            sum += productBatch.availableStock;
          });

          if(sum < quantity){
            throw new ConflictException("So luong khong hop le");
          }
          
          if(listProductBatch.length != 0){
            let idx = 0;
            while(quantity > 0){
              const inventoryHistory = new InventoryHistory();
              inventoryHistory.lastStock = listProductBatch[idx].stock;
              inventoryHistory.warehouseProductBatchId = listProductBatch[idx].id;

              listInventoryHistory.push(inventoryHistory);

              const exportOrderItem = new ExportOrderItem();
              exportOrderItem.warehouseProductBatchId = listProductBatch[idx].id;
              exportOrderItem.productId = listProductBatch[idx].productId;
              exportOrderItem.warehouseId = listProductBatch[idx].warehouseId;

              if(listProductBatch[idx].availableStock < quantity){
                quantity -= listProductBatch[idx].availableStock;
                exportOrderItem.quantity = listProductBatch[idx].availableStock;
                listProductBatch[idx].availableStock = 0;

                inventoryHistory.updatedStock = 0;
              } else {
                exportOrderItem.quantity = quantity;
                inventoryHistory.updatedStock = listProductBatch[idx].availableStock - quantity;

                listProductBatch[idx].availableStock -= quantity;
                
                quantity = 0;
              }

              listExportOrderItem.push(exportOrderItem);

              idx++;
            }
          } else {
            throw new ConflictException();
          }
        }
      }

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        // Cap nhat availableStock
        await queryRunner.manager.save(listProductBatch);

        // Luu don
        getDataFromDTO(exportOrder, createExportOrderDto, true);
        exportOrder.status = ExportOrderStatus.EXPORTING;
        const createdExportOrder = await queryRunner.manager.save(exportOrder);

        listExportOrderItem.forEach((exportOrderItem) => {
          exportOrderItem.exportOrderId = createdExportOrder.id;
        });
        // Luu item
        const listCreatedEOI = await queryRunner.manager.save(listExportOrderItem);

        // Luu lich su
        listCreatedEOI.forEach((createdEOI, idx) => {
          listInventoryHistory[idx].exportOrderItem = createdEOI;
          listInventoryHistory[idx].status = InventoryHistoryStatus.EXPORTING;
          listInventoryHistory[idx].warehouseStaffId = createExportOrderDto.warehouseStaffId;
        });
        await queryRunner.manager.save(listInventoryHistory);

        await queryRunner.commitTransaction();

        createdExportOrder.listExportOrderItem = listCreatedEOI;
        return createdExportOrder;
      } catch (error){
        console.log(error);
        await queryRunner.rollbackTransaction();
        throw new InternalServerErrorException();
      } finally {
        await queryRunner.release();
      }
    }
  }
  
  find(listWarehouseId: string[], listStatus: string[], sortBy: string[], orders: number[], limit: number, offset: number) {
    const query = this.exportOrderRepository.createQueryBuilder('exportOrder')
                                            .where(`exportOrder.warehouseId IN (${listWarehouseId})`)
                                            .innerJoinAndMapMany('exportOrder.listExportOrderItem', ExportOrderItem, 'exportOrderItem', 'exportOrder.id = exportOrderItem.exportOrderId')
                                            .limit(limit)
                                            .offset(offset);

    if(listStatus != null && listStatus.length != 0){
      let s = '';
      listStatus.forEach((status, idx) => {
        if(idx + 1 != listStatus.length){
          s += `'${status}'` + ',';
        } else {
          s += `'${status}'`;
        }
      });
      query.andWhere(`exportOrder.status IN (${s})`)
    }

    console.log(listStatus);

    if(sortBy != null){
      sortBy.forEach((key, idx) => {
        query.addOrderBy(`exportOrder.${key}`, orders[idx] == 1 ? "ASC" : "DESC")
      });
    }

    return query.getMany();
  }

  async findOne(id: string) {
    const exportOrder = await this.exportOrderRepository.createQueryBuilder('exportOrder')
                                                        .where(`exportOrder.id = ${id}`)
                                                        .innerJoinAndMapMany('exportOrder.listExportOrderItem', ExportOrderItem, 'exportOrderItem', 'exportOrder.id = exportOrderItem.exportOrderId')
                                                        .getOne();
    if(exportOrder == null){
      throw new NotFoundException('ExportOrder not found');
    } else {
      return exportOrder;
    }
  }

  // async findUnapprovedExportOrders(limit: number, offset: number, warehouseId: string){
  //   // Kiem tra co warehouse khong - neu khong thi throw exception
  //   await this.warehousesService.findOne(warehouseId);
    
  //   return this.exportOrderRepository.createQueryBuilder('exportOrder')
  //                                     .where(`exportOrder.warehouseId = ${warehouseId}`)
  //                                     .andWhere(`status in [${ExportOrderStatus.EXPORTING}, ${ExportOrderStatus.MODIFIED}]`)
  //                                     .innerJoin(Order, 'order', 'order.id = exportOrder.orderId')
  //                                     .orWhere(`order.warehouseId = ${warehouseId}`)
  //                                     .innerJoinAndMapMany('exportOrder.exportOrderItems', ExportOrderItem, 'exportOrderItem', 'exportOrder.id = exportOrderItem.exportOrderId')
  //                                     .limit(limit)
  //                                     .offset(offset)
  //                                     .getMany();
  // }

  findExportOrdersByOrder(orderId: string, getExportOrderItems: boolean){
    if(getExportOrderItems == false){
      return this.exportOrderRepository.findBy({orderId: orderId});
    } else {
      return this.exportOrderRepository.createQueryBuilder('exportOrder')
                                        .where(`exportOrder.orderId = ${orderId}`)
                                        .innerJoinAndMapMany('exportOrder.listExportOrderItem', ExportOrderItem, 'exportOrderItem', 'exportOrder.id = exportOrderItem.exportOrderId')
                                        .getMany();
    }
  }

  async findWarehouseOfExportOrder(exportOrderId: string){
    const exportOrder = await this.exportOrderRepository.findOneBy({id: exportOrderId});
    if(exportOrder != null){
      if(exportOrder!.warehouseId == null || exportOrder!.warehouseId == undefined){
        const queryResult = await this.exportOrderRepository.createQueryBuilder('exportOrder')
                                                            .select('order.warehouseId', 'warehouseId')
                                                            .where(`exportOrderId = ${exportOrderId}`)
                                                            .innerJoin(Order, 'order', 'order.id = exportOrder.orderId')
                                                            .execute();
        return queryResult!.warehoueId;
      } else {
        return exportOrder!.warehouseId;
      }
    } else {
      throw new NotFoundException();
    }
  }

  findExportOrderItemsIncludeWarehouseProductBatch(exportOrderId: string){
    const query = this.exportOrderItemRepository.createQueryBuilder('exportOrderItem')
                                                .innerJoinAndMapOne('exportOrderItem.warehouseProductBatch', WarehouseProductBatch, 'warehouseProductBatch', 'exportOrderItem.warehouseProductBatchId = warehouseProductBatch.id')
                                                .where(`exportOrderItem.exportOrderId = ${exportOrderId}`)
    // console.log(query.getQuery());

    return query.getMany();
  }

  // Nhan vien cap nhat khi trang thai don hang la exporting
  // Xoa lich su, xoa item, dieu chinh availableStock
  // Tao item moi, tao lich su moi, dieu chinh availableStock
  async updateByWarehouseStaff(exportOrderId: string, updateExportOrderDto: UpdateExportOrderDto){
    const warehouseEmployee = await this.warehousesService.findOneWarehouseEmployee(updateExportOrderDto.warehouseStaffId!);
    const exportOrder = await this.findOne(exportOrderId);
    if (warehouseEmployee.warehouseId != exportOrder!.warehouseId){
      throw new ConflictException("Nhan vien khong thuoc kho nay");
    } else if (exportOrder!.status == ExportOrderStatus.APPROVED_EXPORT){
      throw new ConflictException("Nhan vien khong duoc sua don da xuat kho");
    } else {
      // Xoa lich su, xoa item, dieu chinh availableStock
      const listOldExportOrderItem = await this.exportOrderItemRepository.findBy({exportOrderId: exportOrderId});
      const listOldInventoryHistory = await this.inventoryhistoriesService.findByExportOrderItems(listOldExportOrderItem!);

      const queryRunner = await this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      
      try{
        exportOrder!.status = ExportOrderStatus.MODIFIED;
        
        await queryRunner.manager.save(exportOrder!);

        await queryRunner.manager.remove(listOldInventoryHistory);
        await queryRunner.manager.remove(listOldExportOrderItem);

        // Tao item moi, tao lich su moi, dieu chinh availableStock
        const listNewExportOrderItem : ExportOrderItem[] = [];
        const listNewInventoryHistory : InventoryHistory[] = [];
        const listNewWarehouseProductBatch : WarehouseProductBatch[] = [];
        
        updateExportOrderDto.listExportOrderItemDto!.forEach(async (itemDto) => {
          if(itemDto.listWarehouseProductBatchDto == undefined || itemDto.listWarehouseProductBatchDto == null || itemDto.listWarehouseProductBatchDto.length == 0){
            // Lay san pham len va tao lo nhap cho du so luong, sau do cap nhat
            const listProductBatch = await this.warehousesService.findWarehouseProductBatchsByProductForExport(itemDto.productId, updateExportOrderDto.warehouseId!, updateExportOrderDto.currentTimeStamp!, true, false, false);
            let quantity = itemDto.quantity;
            let sum = 0;
            listProductBatch.forEach((productBatch) => {
              sum += productBatch.availableStock;
            })

            if(sum < quantity){
              throw new ConflictException(`So luong khong hop le, productId: ${itemDto.productId}`);
            } else {
              let idx = 0;
              while(quantity > 0){
                const exportOrderItem = new ExportOrderItem();
                const inventoryHistory = new InventoryHistory();
                inventoryHistory.lastStock = listProductBatch[idx].availableStock;

                if(listProductBatch[idx].availableStock <= quantity){
                  quantity -= listProductBatch[idx].availableStock;
                  exportOrderItem.quantity = listProductBatch[idx].availableStock;
                  listProductBatch[idx].availableStock = 0;

                  inventoryHistory.updatedStock = 0;
                } else {
                  inventoryHistory.updatedStock = listProductBatch[idx].availableStock - quantity;

                  listProductBatch[idx].availableStock -= quantity;
                  exportOrderItem.quantity = quantity;
                  quantity = 0;
                }

                listNewWarehouseProductBatch.push(listProductBatch[idx]);

                exportOrderItem.exportOrderId = exportOrder!.id;
                exportOrderItem.productId = itemDto.productId;
                exportOrderItem.warehouseProductBatchId = listProductBatch[idx].id;

                inventoryHistory.status = InventoryHistoryStatus.EXPORTING;
                inventoryHistory.warehouseProductBatchId = listProductBatch[idx].id;
                inventoryHistory.warehouseStaffId = updateExportOrderDto.warehouseStaffId!;

                listNewInventoryHistory.push(inventoryHistory);
                
                idx++;
                if(idx + 1 > listProductBatch.length){
                  throw new ConflictException(`So luong khong hop le, productId: ${itemDto.productId}`)
                }
              }
            }

          } else {
            // Lay lo hang len va kiem tra sau do cap nhat
            itemDto.listWarehouseProductBatchDto.forEach(async (warehouseProductBatchDto) => {
              const warehouseProductBatch = await this.warehousesService.findOneWarehouseProductBatch(warehouseProductBatchDto.id);

              if(warehouseProductBatch!.availableStock >= warehouseProductBatchDto.quantity){
                const inventoryHistory = new InventoryHistory();
                inventoryHistory.status = InventoryHistoryStatus.EXPORTING;
                inventoryHistory.lastStock = warehouseProductBatch!.availableStock
                inventoryHistory.updatedStock = warehouseProductBatch!.availableStock - itemDto.quantity;;
                inventoryHistory.warehouseProductBatch = warehouseProductBatch!;
                inventoryHistory.warehouseStaffId = updateExportOrderDto.warehouseStaffId!;

                listNewInventoryHistory.push(inventoryHistory);

                warehouseProductBatch!.availableStock -= itemDto.quantity;
                listNewWarehouseProductBatch.push(warehouseProductBatch!);

                const exportOrderItem = new ExportOrderItem();
                exportOrderItem.exportOrderId = exportOrder!.id;
                exportOrderItem.productId = itemDto.productId;
                exportOrderItem.quantity = itemDto.quantity;
                exportOrderItem.warehouseProductBatchId = warehouseProductBatch!.id;

                listNewExportOrderItem.push(exportOrderItem);
              } else {
                throw new ConflictException(`So luong khong hop le, productId: ${itemDto.productId}, ${warehouseProductBatchDto.quantity} > ${warehouseProductBatch.availableStock}`);
              }
            });
          }
        });

        await queryRunner.manager.save(listNewWarehouseProductBatch);

        const listCreatedEOI = await queryRunner.manager.save(listNewExportOrderItem);
        listCreatedEOI.forEach((exportOrderItem, idx) => {
          listNewInventoryHistory[idx].exportOrderItem = exportOrderItem;
        });

        await queryRunner.manager.save(listNewInventoryHistory);
        await queryRunner.commitTransaction();

        return listCreatedEOI;
      } catch(error){
        console.log(error);
        await queryRunner.rollbackTransaction();
        throw new InternalServerErrorException();
      } finally{
        await queryRunner.release();
      }
    }
  }

  // Quan ly cap nhat trang thai don xuat kho
  // Luu moi lich su: Lay lich su len -> parse du lieu -> luu
  // Kiem tra va cap nhat so luong trong kho: cap nhat warehouseProductBatch.stock, availableStock
  async approveByManager(managerId: string, updateExportOrderByManagerDto: UpdateExportOrderByManagerDto){
    const warehouseEmployee = await this.warehousesService.findOneWarehouseEmployee(managerId);
    const exportOrder = await this.findOne(updateExportOrderByManagerDto.exportOrderId);
    if(warehouseEmployee.warehouseId != exportOrder!.warehouseId){
      throw new ConflictException("Nhan vien khong thuoc kho nay");
    } else if(exportOrder!.status == ExportOrderStatus.APPROVED_EXPORT){
      throw new ConflictException("Quan ly khong duoc duyet lai don");
    } else {
      exportOrder!.managerId = managerId;
      exportOrder!.status = ExportOrderStatus.APPROVED_EXPORT;

      const listExportOrderItem = await this.findExportOrderItemsIncludeWarehouseProductBatch(updateExportOrderByManagerDto.exportOrderId);

      const listInventoryHistory = await this.inventoryhistoriesService.findByExportOrderItems(listExportOrderItem);

      listInventoryHistory.forEach((inventoryHistory) => {
        inventoryHistory.id = undefined;
        inventoryHistory.status = InventoryHistoryStatus.APPROVED_EXPORT;
        inventoryHistory.managerId = managerId;
      });

      const listProductBatch : WarehouseProductBatch[] = [];
      listExportOrderItem.forEach((exportOrderItem) => {
        const warehouseProductBatch = exportOrderItem.warehouseProductBatch;
        warehouseProductBatch.stock -= exportOrderItem.quantity;

        listProductBatch.push(exportOrderItem.warehouseProductBatch);
      });

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try{
        const savedExportOrder = await queryRunner.manager.save(exportOrder!);
        await queryRunner.manager.save(listProductBatch);
        await queryRunner.manager.save(listInventoryHistory);

        await queryRunner.commitTransaction();

        return savedExportOrder;
      } catch(error){
        console.log(error);
        queryRunner.rollbackTransaction();

        throw new InternalServerErrorException();
      } finally {
        queryRunner.release();
      }
    }
  }

  // Nhan vien xoa don khi don trong trang thai Processing
  // Xoa lich su, xoa item, cap nhat availableStock, xoa don
  async removeByWarehouseStaff(exportOrderId: string, warehouseStaffId: string) {
    const warehouseEmployee = await this.warehousesService.findOneWarehouseEmployee(warehouseStaffId);
    const exportOrder = await this.findOne(exportOrderId);
    if(warehouseEmployee.warehouseId != exportOrder!.warehouseId){
      throw new ConflictException("Nhan vien khong thuoc kho nay");
    } else if(exportOrder!.status == ExportOrderStatus.APPROVED_EXPORT){
      throw new ConflictException("Nhan vien khong duoc xoa don da xac nhan xuat kho");
    } else {
      const listExportOrderItem = await this.exportOrderItemRepository.findBy({exportOrderId: exportOrder!.id});
      const listInventoryHistory = await this.inventoryhistoriesService.findByExportOrderItems(listExportOrderItem);
      const listWarehouseProductBatch : WarehouseProductBatch[] = [];

      listExportOrderItem.forEach(async (exportOrderItem) => {
        const warehouseProductBatch = await this.warehousesService.findOneWarehouseProductBatch(exportOrderItem.warehouseProductBatchId);
        warehouseProductBatch!.availableStock += exportOrderItem.quantity;
        listWarehouseProductBatch.push(warehouseProductBatch!);
      });

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try{
        await queryRunner.manager.remove(listInventoryHistory);
        await queryRunner.manager.remove(listExportOrderItem);

        await queryRunner.manager.save(listWarehouseProductBatch);

        const removedExportOrder = await queryRunner.manager.remove(exportOrder!);

        await queryRunner.commitTransaction();
        
        return removedExportOrder;
      } catch(error){
        console.log(error);
        queryRunner.rollbackTransaction();
        throw new InternalServerErrorException();
      } finally {
        queryRunner.release();
      }
    }
  }

  // Quan ly xoa don
  // Xoa lich su, xoa item, cap nhat lai so luong, xoa don
  async removeByManager(exportOrderId: string, maangerId: string) {
    const warehouseEmployee = await this.warehousesService.findOneWarehouseEmployee(maangerId);
    const exportOrder = await this.findOne(exportOrderId);

    if(warehouseEmployee.warehouseId != exportOrder!.warehouseId){
      throw new ConflictException("Nhan vien khong thuoc kho nay");
    } else {
      const listExportOrderItem = await this.exportOrderItemRepository.findBy({exportOrderId: exportOrder!.id});
      const listInventoryHistory = await this.inventoryhistoriesService.findByExportOrderItems(listExportOrderItem);
      const listWarehouseProductBatch : WarehouseProductBatch[] = [];
      
      if(exportOrder!.status == ExportOrderStatus.EXPORTING){
        listExportOrderItem.forEach(async (exportOrderItem) => {
          const warehouseProductBatch = await this.warehousesService.findOneWarehouseProductBatchByExportOrderItem(exportOrderItem.id);
          warehouseProductBatch!.availableStock += exportOrderItem.quantity;
          listWarehouseProductBatch.push(warehouseProductBatch!);
        });
      } else{
        listExportOrderItem.forEach(async (exportOrderItem) => {
          const warehouseProductBatch = await this.warehousesService.findOneWarehouseProductBatchByExportOrderItem(exportOrderItem.id);
          warehouseProductBatch!.stock += exportOrderItem.quantity;
          warehouseProductBatch!.availableStock += exportOrderItem.quantity;
          listWarehouseProductBatch.push(warehouseProductBatch!);
        });
      }

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try{
        await queryRunner.manager.remove(listInventoryHistory);
        await queryRunner.manager.remove(listExportOrderItem);
        
        await queryRunner.manager.save(listWarehouseProductBatch);

        const removedExportOrder = await queryRunner.manager.remove(exportOrder!);
        await queryRunner.commitTransaction();

        return removedExportOrder;
      } catch(error){
        console.log(error);
        queryRunner.rollbackTransaction();
        throw new InternalServerErrorException();
      } finally{
        queryRunner.release();
      }
    }
  } 
}
