import { Injectable } from '@nestjs/common';
import { ProductStatisticDto } from './dto/product-statistic.dto';
import { StatisticDto } from './dto/statistic.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { Repository } from 'typeorm';
import { Agent } from '../agents/entities/agent.entity';
import { InventoryHistory, InventoryHistoryStatus } from '../inventory-histories/entities/inventory-history.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { ImportOrder } from '../import-orders/entities/import-order.entity';
import { ExportOrder, ExportOrderStatus } from '../export-orders/entities/export-order.entity';
import { Order } from '../orders/entities/order.entity';
import { AgentStatisticDto } from './dto/agent-statistic.dto';
import { ImportOrderItem } from '../import-orders/entities/import-order-item.entity';
import { ExportOrderItem } from '../export-orders/entities/export-order-item.entity';
import { WarehouseProduct } from '../warehouses/entities/warehouse-product.entity';
import { WarehouseProductStatisticDto } from './dto/warehouse-product-statistic.dto';
import { WarehouseProductBatch } from '../warehouses/entities/warehouse-product-batch.entity';
import { StockStatisticDto } from './dto/stock-statistic.dto';
import { WarehouseEmployee } from '../warehouses/entities/warehouse-employee.entity';
import { InventoryVariationDto } from './dto/inventory-variation-statistic.dto';
import { MonthlyImportReportDto } from './dto/monthly-import-report.dto.';
import { DailyImportReportDto } from './dto/daily-import-report.dto';
import { MonthlyExportReportDto } from './dto/monthly-export-report.dto';
import { DailyExportReportDto } from './dto/daily-export-report.dto';
import { SupplierStatisticDto } from './dto/supplier-statistic.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class statisticsService {
  constructor(
    @InjectRepository(WarehouseProduct)
    private readonly warehouseProductRepository: Repository<WarehouseProduct>,
    
    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,
    
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    
    @InjectRepository(ImportOrder)
    private readonly importOrderRepository: Repository<ImportOrder>,
    
    @InjectRepository(ExportOrder)
    private readonly exportOrderRepository: Repository<ExportOrder>,
    
    @InjectRepository(InventoryHistory)
    private readonly inventoryHistoryRepository: Repository<InventoryHistory>,
  ){}

  async getBestSellerStatistic(statisticDto: StatisticDto){
    const startDate = statisticDto.startDate.toISOString().replace('T', ' ').replace('Z', '');
    const endDate = statisticDto.endDate.toISOString().replace('T', ' ').replace('Z', '');

    const query = this.exportOrderRepository.createQueryBuilder('exportOrder')
                                              .where(`exportOrder.status = '${ExportOrderStatus.APPROVED_EXPORT}'`)
                                              .leftJoin(Order, 'order', 'order.id = exportOrder.orderId')
                                              .innerJoin(ExportOrderItem, 'exportOrderItem', 'exportOrder.id = exportOrderItem.exportOrderId')
                                              .innerJoin(WarehouseProduct, 'warehouseProduct', 'exportOrderItem.productId = warehouseProduct.productId AND exportOrderItem.warehouseId = warehouseProduct.warehouseId')
                                              .innerJoin(Product, 'product', 'exportOrderItem.productId = product.id')
                                              .andWhere(`exportOrder.createdAt >= '${startDate}'`)
                                              .andWhere(`exportOrder.createdAt <= '${endDate}'`)
                                              .select(['product.id AS product_id', 'product.name AS product_name', 'SUM(exportOrderItem.quantity) AS total_sold_quantity'])
                                              .groupBy('product_id');
    
    if(statisticDto.orderBy != null){
      statisticDto.orderBy.forEach((key, idx) => {
        query.addOrderBy(`${key}`, statisticDto.sorts[idx] == 1 ? 'ASC' : 'DESC');
      });
    }
    if(statisticDto.getByEntireSystem == true){
      const queryResults = await query.execute(); 
      const listProductStatisticDto : ProductStatisticDto[] = [];   
      queryResults.forEach((result) => {
        const productStatisticDto = new ProductStatisticDto();
        productStatisticDto.id = result.product_id;
        productStatisticDto.name = result.product_name;
        productStatisticDto.totalSold = result.total_sold_quantity;
        
        listProductStatisticDto.push(productStatisticDto);
      });

      return listProductStatisticDto;                         
    } else {
      query.addGroupBy('warehouseProduct.warehouseId');
      
      query.andWhere(`(exportOrder.warehouseId IN (${statisticDto.listWarehouseId}) OR order.warehouseId IN (${statisticDto.listWarehouseId}))`)

      const queryResults = await query.execute(); 
      
      const listWarehouseProductStatisticDto : WarehouseProductStatisticDto[] = [];
      queryResults.forEach((result) => {
        const warehouseProductStatisticDto = new WarehouseProductStatisticDto();
        const product = new Product();
        product.name = result.product_name;

        warehouseProductStatisticDto.productId = result.product_id;
        warehouseProductStatisticDto.product = product;
        warehouseProductStatisticDto.totalSold = result.total_sold_quantity;

        listWarehouseProductStatisticDto.push(warehouseProductStatisticDto);
      });

      return listWarehouseProductStatisticDto;
    }
  }

  async getExpiringProductBatchStatistic(statisticDto: StatisticDto){
    const endDate = statisticDto.endDate.toISOString().replace('T', ' ').replace('Z', '');
    const query = this.warehouseProductRepository.createQueryBuilder('warehouseProduct')
                                                  .select(['product.id AS product_id', 'product.name AS product_name', 'SUM(warehouseProductBatch.stock) AS total_stock'])
                                                  .innerJoin(Product, 'product', 'product.id = warehouseProduct.productId')
                                                  .innerJoin(WarehouseProductBatch, 'warehouseProductBatch', 'warehouseProductBatch.productId = product.id AND warehouseProductBatch.warehouseId = warehouseProduct.warehouseId')
                                                  .where('warehouseProductBatch.stock <> 0')
                                                  .where(`warehouseProductBatch.expiredAt < '${endDate}'`)
                                                  .groupBy('product_id')
    
    if(statisticDto.orderBy != null){
      statisticDto.orderBy.forEach((key, idx) => {
        query.addOrderBy(key, statisticDto.sorts[idx] == 1 ? 'ASC' : 'DESC');
      });
    }

    if(statisticDto.getByEntireSystem == false){                    
      statisticDto.listWarehouseId.forEach((warehouseId) => {
        query.andWhere(`warehouseProduct.warehouseId = ${warehouseId}`)
      });  
    }

    const queryResults = await query.execute(); 
    const stockStatisticDto = new StockStatisticDto();
    const listProductStatisticDto : ProductStatisticDto[] = [];
    let totalStock = 0;
    queryResults.forEach((result) => {
      const productStatisticDto = new ProductStatisticDto();
      productStatisticDto.id = result.product_id;
      productStatisticDto.name = result.product_name;
      productStatisticDto.totalStock = parseInt(result.total_stock);
      
      if(productStatisticDto.totalStock != 0){
        listProductStatisticDto.push(productStatisticDto);
      }

      totalStock += parseInt(result.total_stock);
    });

    stockStatisticDto.listProductStatisticDto = listProductStatisticDto;
    stockStatisticDto.totalStock = totalStock;

    return stockStatisticDto;   
  }
  
  async getProductStockStatistic(statisticDto: StatisticDto){
    const query = this.warehouseProductRepository.createQueryBuilder('warehouseProduct')
                                                  .innerJoin(Product, 'product', 'product.id = warehouseProduct.productId')
                                                  .innerJoin(WarehouseProductBatch, 'warehouseProductBatch', 'warehouseProductBatch.productId = warehouseProduct.productId AND warehouseProductBatch.warehouseId = warehouseProduct.warehouseId')
                                                  .where('warehouseProductBatch.stock != 0')
                                                  .groupBy('product.id')
                                                  .select(['product.id AS product_id', 'product.name AS product_name', 'SUM(warehouseProductBatch.stock) AS total_stock']);
    
    if(statisticDto.orderBy != null){
      statisticDto.orderBy.forEach((key, idx) => {
        query.addOrderBy(`${key}`, statisticDto.sorts[idx] == 1 ? 'ASC' : 'DESC');
      });
    }

    if(statisticDto.getByEntireSystem == false){                    
      statisticDto.listWarehouseId.forEach((warehouseId) => {
        query.andWhere(`warehouseProduct.warehouseId = ${warehouseId}`)
      });  
    }

    const queryResults = await query.execute(); 

    console.log(queryResults);

    const stockStatisticDto = new StockStatisticDto();
    stockStatisticDto.listProductStatisticDto = [];

    let totalStock = 0;
    queryResults.forEach((result) => {
      const productStatisticDto = new ProductStatisticDto();

      productStatisticDto.id = result.product_id;
      productStatisticDto.name = result.product_name;
      productStatisticDto.totalStock = parseInt(result.total_stock);
      
      stockStatisticDto.listProductStatisticDto!.push(productStatisticDto);

      totalStock += parseInt(result.total_stock);
    });

    stockStatisticDto.totalStock = totalStock;

    return stockStatisticDto;     
  }
  
  async getInventoryHistoryVariation(statisticDto: StatisticDto){
    const startDate = statisticDto.startDate.toISOString().replace('T', ' ').replace('Z', '');
    const endDate = statisticDto.endDate.toISOString().replace('T', ' ').replace('Z', '');

    const query = this.inventoryHistoryRepository.createQueryBuilder('ih')
                                                  .where(`(ih.status = '${InventoryHistoryStatus.APPROVED_EXPORT}' OR ih.status = '${InventoryHistoryStatus.APPROVED_IMPORT}')`)
                                                  .select(['ih.lastStock AS last_stock', 'ih.updatedStock AS updated_stock', '(ih.updatedStock - ih.lastStock) AS variation'])
                                                  .addSelect(['staff.employeeId AS staff_id', 'user_employee.name AS staff_name', 'manager.employeeId AS manager_id', 'user_manager.name AS manager_name'])
                                                  .addSelect(['product.id AS product_id', 'product.name AS product_name', 'ih.createdAt AS created_at', 'ih.updatedAt AS updated_at'])
                                                  .orderBy('ih.createdAt', 'ASC')
                                                  .andWhere(`ih.createdAt >= '${startDate}'`)
                                                  .andWhere(`ih.createdAt <= '${endDate}'`)
                                                  .innerJoin(WarehouseEmployee, 'staff', 'staff.employeeId = ih.warehouseStaffId')
                                                  .innerJoin(WarehouseEmployee, 'manager', 'manager.employeeId = ih.managerId')
                                                  .innerJoin(User, 'user_employee', 'user_employee.id = staff.employeeId')
                                                  .innerJoin(User, 'user_manager', 'user_manager.id = manager.employeeId')
                                                  .leftJoin(WarehouseProductBatch, 'warehouseProductBatch', 'warehouseProductBatch.id = ih.warehouseProductBatchId')
                                                  .innerJoin(Product, 'product', 'product.id = warehouseProductBatch.productId')
    if(statisticDto.orderBy != null){
      statisticDto.orderBy.forEach((key, idx) => {
        query.addOrderBy(`${key}`, statisticDto.sorts[idx] == 1 ? 'ASC' : 'DESC');
      });
    }

    if(statisticDto.getByEntireSystem == false){                    
      statisticDto.listWarehouseId.forEach((warehouseId) => {
        query.andWhere(`warehouseProductBatch.warehouseId = ${warehouseId}`)
      });  
    }

    if(statisticDto.listProductId?.length != 0){
      query.andWhere(`product.id IN (${statisticDto.listProductId})`);
    }

    const queryResults = await query.execute();

    console.log(queryResults);

    const inventoryHistoryVariationDto = new InventoryVariationDto();
    let totalIncreation = 0;
    let totalDecreation = 0;
    const listInventoryHistory : InventoryHistory[] = [];
    queryResults.forEach((queryResult) => {
      const inventoryHistory = new InventoryHistory();
      const manager = new User();
      manager.id = queryResult.manager_id;
      manager.name = queryResult.manager_name;
      inventoryHistory.manager = manager;

      const staff = new User();
      staff.id = queryResult.staff_id;
      staff.name = queryResult.staff_name;
      inventoryHistory.warehouseStaff = staff;

      inventoryHistory.lastStock = parseInt(queryResult.lastStock);
      inventoryHistory.updatedStock = parseInt(queryResult.updatedStock);
      inventoryHistory['product_id'] = queryResult.product_id;
      inventoryHistory['product_name'] = queryResult.product_name;
      inventoryHistory.createdAt = queryResult.created_at;
      inventoryHistory.updatedAt = queryResult.updated_at;

      listInventoryHistory.push(inventoryHistory);

      if(queryResult.variation > 0){
        totalIncreation += parseInt(queryResult.variation);
      } else {
        totalDecreation += parseInt(queryResult.variation);
      }
    });
    inventoryHistoryVariationDto.totalIncrease = totalIncreation;
    inventoryHistoryVariationDto.totalDecrease = totalDecreation;
    // totalDecreation < 0;
    inventoryHistoryVariationDto.totalVariation = totalIncreation + totalDecreation;

    inventoryHistoryVariationDto.listInventoryHistory = listInventoryHistory;

    return inventoryHistoryVariationDto;
  }
  
  async getAgentStatistic(statisticDto: StatisticDto){
    const startDate = statisticDto.startDate.toISOString().replace('T', ' ').replace('Z', '');
    const endDate = statisticDto.endDate.toISOString().replace('T', ' ').replace('Z', '');
    
    const query = this.agentRepository.createQueryBuilder('agent')
                                      .innerJoinAndMapMany('agent.listOrder', Order, 'order', 'agent.id = order.agentId')
                                      .innerJoinAndMapMany('agent.listExportOrder', ExportOrder, 'exportOrder', '(agent.id = exportOrder.agentId OR order.id = exportOrder.orderId)')
                                      .innerJoinAndMapMany('exportOrder.listExportOrderItem', ExportOrderItem, 'exportOrderItem', 'exportOrder.id = exportOrderItem.exportOrderId')
                                      .groupBy('agent.id')
                                      .select(['agent.id AS agent_id', 'agent.name AS agent_name',"COUNT(DISTINCT exportOrder.id) AS number_of_export_order", "SUM(exportOrderItem.quantity) AS total_quantity"])
                                      .where(`exportOrder.createdAt >= '${startDate}'`)
                                      .andWhere(`exportOrder.createdAt <= '${endDate}'`);

    if(statisticDto.getByEntireSystem == false){
      query.andWhere(`(exportOrder.warehouseId IN (${statisticDto.listWarehouseId}) OR order.warehouseId IN (${statisticDto.listWarehouseId}))`)
    }
    if(statisticDto.orderBy != null){
      statisticDto.orderBy.forEach((key, idx) => {
        query.addOrderBy(`${key}`, statisticDto.sorts[idx] == 1 ? 'ASC' : 'DESC')
      });
    }

    const queryResults = await query.execute();

    const listAgentStatisticDto : AgentStatisticDto[] = [];
    queryResults.forEach((result) => {
      const agentStatisticDto = new AgentStatisticDto();
      agentStatisticDto.id = result.agent_id;
      agentStatisticDto.name = result.agent_name;
      agentStatisticDto.totalExportOrder = parseInt(result.number_of_export_order);
      agentStatisticDto.totalQuantity = parseInt(result.total_quantity);
      agentStatisticDto.avgQuantityPerExportOrder = parseFloat((agentStatisticDto.totalQuantity / agentStatisticDto.totalExportOrder).toFixed(2));
      
      listAgentStatisticDto.push(agentStatisticDto);
    });

    return listAgentStatisticDto;
  }
  
  async getSupplierStatistic(statisticDto: StatisticDto){
    const startDate = statisticDto.startDate.toISOString().replace('T', ' ').replace('Z', '');
    const endDate = statisticDto.endDate.toISOString().replace('T', ' ').replace('Z', '');

    const query = this.supplierRepository.createQueryBuilder('supplier')
                                      .innerJoinAndMapMany('supplier.listImportOrder', ImportOrder, 'importOrder', 'supplier.id = importOrder.supplierId')
                                      .innerJoinAndMapMany('importOrder.listImportOrderItem', ImportOrderItem, 'importOrderItem', 'importOrder.id = importOrderItem.importOrderId')
                                      .groupBy('supplier.id')
                                      .select(['supplier.id AS supplier_id', 'supplier.name AS supplier_name',"COUNT(DISTINCT importOrder.id) AS number_of_import_order", "SUM(importOrderItem.quantity) AS total_quantity"])
                                      .where(`importOrder.createdAt >= '${startDate}'`)
                                      .andWhere(`importOrder.createdAt <= '${endDate}'`);

    if(statisticDto.getByEntireSystem == false){
      query.andWhere(`importOrder.warehouseId IN (${statisticDto.listWarehouseId})`)
    }
    if(statisticDto.orderBy != null){
      statisticDto.orderBy.forEach((key, idx) => {
        query.addOrderBy(`${key}`, statisticDto.sorts[idx] == 1 ? 'ASC' : 'DESC')
      });
    }

    const queryResults = await query.execute();
    console.log(queryResults);

    const listSupplierStatisticDto : SupplierStatisticDto[] = [];
    queryResults.forEach((result) => {
      const supplierStatisticDto = new SupplierStatisticDto();
      supplierStatisticDto.id = result.supplier_id;
      supplierStatisticDto.name = result.supplier_name;
      supplierStatisticDto.totalImportOrder = result.number_of_import_order;
      supplierStatisticDto.totalQuantity = result.total_quantity;
      supplierStatisticDto.avgQuantityPerImportOrder = parseFloat((supplierStatisticDto.totalQuantity / supplierStatisticDto.totalImportOrder).toFixed(2));
      
      listSupplierStatisticDto.push(supplierStatisticDto);
    });

    return listSupplierStatisticDto;
  }
  
  async getMontlyImportReport(statisticDto: StatisticDto){
    const query = this.importOrderRepository.createQueryBuilder('importOrder')
                                            .select(['COUNT(DISTINCT importOrder.id) AS number_of_import_order'])
                                            .addSelect('SUM(importOrderItem.quantity) AS total_quantity')
                                            .addSelect('EXTRACT(DAY FROM importOrder.updatedAt) as day')
                                            .where(`EXTRACT(MONTH FROM importOrder.updatedAt) = ${statisticDto.month.getMonth() + 1}`)
                                            .innerJoin(ImportOrderItem, 'importOrderItem', 'importOrderItem.importOrderId = importOrder.id')
                                            .andWhere(`EXTRACT(YEAR FROM importOrder.updatedAt) = ${statisticDto.month.getFullYear()}`)
                                            .groupBy('day');

    if(statisticDto.getByEntireSystem == false){
      statisticDto.listWarehouseId.forEach((warehouseId) => {
        query.andWhere(`importOrder.warehouseId = ${warehouseId}`)
      });
    }
    if(statisticDto.orderBy != null){
      statisticDto.orderBy.forEach((key, idx) => {
        query.addOrderBy(key, statisticDto.sorts[idx] == 1 ? 'ASC' : 'DESC')
      });
    }

    console.log(query.getQuery());

    const queryResults = await query.execute();

    console.log(queryResults);

    const montlyImportReportDto = new MonthlyImportReportDto();
    montlyImportReportDto.chartData = [];
    
    let totalImportOrder = 0;
    let totalQuantity = 0;
    queryResults.forEach((queryResult) => {
      const dailyImportReport = new DailyImportReportDto();
      dailyImportReport.date = queryResult.day;
      dailyImportReport.totalImportOrder = parseInt(queryResult.number_of_import_order);
      dailyImportReport.totalQuantity = parseInt(queryResult.total_quantity);

      totalImportOrder += parseInt(queryResult.number_of_import_order);
      totalQuantity += parseInt(queryResult.total_quantity);

      montlyImportReportDto.chartData.push(dailyImportReport);
    });
    montlyImportReportDto.totalImportOrder = totalImportOrder;
    montlyImportReportDto.totalQuantity = totalQuantity;

    return montlyImportReportDto;
  }
  
  async getMonthlyExportReport(statisticDto: StatisticDto){
    const query = this.exportOrderRepository.createQueryBuilder('exportOrder')
                                            .select(['COUNT(DISTINCT exportOrder.id) AS number_of_export_order'])
                                            .addSelect('SUM(exportOrderItem.quantity) AS total_quantity')
                                            .addSelect('EXTRACT(DAY FROM exportOrder.updatedAt) as day')
                                            .innerJoin(ExportOrderItem, 'exportOrderItem', 'exportOrderItem.exportOrderId = exportOrder.id')
                                            .where(`EXTRACT(MONTH FROM exportOrder.updatedAt) = ${statisticDto.month.getMonth() + 1}`)
                                            .andWhere(`EXTRACT(YEAR FROM exportOrder.updatedAt) = ${statisticDto.month.getFullYear()}`)
                                            .groupBy('day')

    if(statisticDto.getByEntireSystem == false){
      statisticDto.listWarehouseId.forEach((warehouseId) => {
        query.andWhere(`exportOrder.warehouseId = ${warehouseId}`)
      });
    }
    if(statisticDto.orderBy != null){
      statisticDto.orderBy.forEach((key, idx) => {
        query.addOrderBy(key, statisticDto.sorts[idx] == 1 ? 'ASC' : 'DESC')
      });
    }

    const queryResults = await query.execute();
    const montlyExportReportDto = new MonthlyExportReportDto();
    montlyExportReportDto.chartData = [];

    let totalExportOrder = 0;
    let totalQuantity = 0;
    queryResults.forEach((queryResult) => {
      const dailyExportReport = new DailyExportReportDto();
      dailyExportReport.date = queryResult.day;
      dailyExportReport.totalExportOrder = parseInt(queryResult.number_of_export_order);
      dailyExportReport.totalQuantity = parseInt(queryResult.total_quantity);

      totalExportOrder += parseInt(queryResult.number_of_export_order);
      totalQuantity += parseInt(queryResult.total_quantity);

      montlyExportReportDto.chartData.push(dailyExportReport);
    });
    montlyExportReportDto.totalExportOrder = totalExportOrder;
    montlyExportReportDto.totalQuantity = totalQuantity;

    return montlyExportReportDto;
  }
}
