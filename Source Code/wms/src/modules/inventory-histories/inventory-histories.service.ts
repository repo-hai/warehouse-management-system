import { Injectable, NotFoundException } from '@nestjs/common';
import { InventoryHistory, InventoryHistoryStatus } from './entities/inventory-history.entity';
import { ImportOrderItem } from '../import-orders/entities/import-order-item.entity';
import { ExportOrderItem } from '../export-orders/entities/export-order-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImportOrder } from '../import-orders/entities/import-order.entity';

@Injectable()
export class InventoryHistoriesService {
  constructor(
    @InjectRepository(InventoryHistory)
    private inventoryHistoryRepository: Repository<InventoryHistory>
  ){}

  createByListEntity(listInventoryHistory: InventoryHistory[]){
    return this.inventoryHistoryRepository.save(listInventoryHistory);
  }

  createByEntity(inventoryHistory: InventoryHistory){
    return this.inventoryHistoryRepository.save(inventoryHistory);
  }

  async findOne(id: string){
    const inventoryHistory = await this.inventoryHistoryRepository.findOneBy({id: id});

    if(inventoryHistory == null){
      throw new NotFoundException('Inventory history not found');
    } else {
      return inventoryHistory;
    }
  }

  findProcessingHistoryByImportOrderItems(listImportOrderItem: ImportOrderItem[]){
    const listImportOrderItemId: string[] = [];
    listImportOrderItem.forEach((importOrderItem) => {
      listImportOrderItemId.push(importOrderItem.id.toString());
    })

    return this.inventoryHistoryRepository.createQueryBuilder('inventoryHistory')
                                          .where(`inventoryHistory.importOrderItemId IN (${listImportOrderItemId})`)
                                          .andWhere(`inventoryHistory.status = '${InventoryHistoryStatus.IMPORTING}'`)
                                          .getMany();
  }

  findProcessingHistoryByImportOrder(importOrderId: string){
    return this.inventoryHistoryRepository.createQueryBuilder('inventoryHistory')
                                          .innerJoin(ImportOrderItem, 'importOrderItem', 'importOrderItem.id = inventoryHistory.importOrderItemId')
                                          .innerJoin(ImportOrder, 'importOrder', 'importOrder.id = importOrderItem.importOrderId')
                                          .where(`importOrder.id = ${importOrderId}`)
                                          .andWhere(`inventoryHistory.status = '${InventoryHistoryStatus.IMPORTING}'`)
                                          .getMany();
  }

  findApprovedHistoriesByImportOrderItems(listImportOrderItem: ImportOrderItem[]){
    const listImportOrderItemId: string[] = [];
    listImportOrderItem.forEach((importOrderItem) => {
      listImportOrderItemId.push(importOrderItem.id.toString());
    })

    const query = this.inventoryHistoryRepository.createQueryBuilder('inventoryHistory')
                                          .where(`inventoryHistory.importOrderItemId IN (${listImportOrderItemId})`)
                                          .andWhere(`inventoryHistory.status = '${InventoryHistoryStatus.APPROVED_IMPORT}'`);
    return query.getMany();
  }

  findByExportOrderItems(listExportOrderItem: ExportOrderItem[]){
    const listExportOrderItemId: string[] = [];
    listExportOrderItem.forEach((exportOrderItem) => {
      listExportOrderItemId.push(exportOrderItem.id.toString());
    })

    return this.inventoryHistoryRepository.createQueryBuilder('inventoryHistory')
                                          .where(`inventoryHistory.exportOrderItemId IN (${listExportOrderItemId})`)
                                          .andWhere(`inventoryHistory.status = '${InventoryHistoryStatus.EXPORTING}'`)
                                          .getMany();
  }

  async removeByListEntity(listInventoryHistory: InventoryHistory[]) {
    return this.inventoryHistoryRepository.remove(listInventoryHistory);
  }
}
