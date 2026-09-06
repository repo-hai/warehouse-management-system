import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderProduct } from './entities/order-product.entity';
import { DataSource, Repository } from 'typeorm';
import { ExportOrdersService } from '../export-orders/export-orders.service';
import { GetRemainingInAnOrder } from './dto/get-remaining-in-an-order.dto';
import { ProductsService } from '../products/products.service';
import { Warehouse } from '../warehouses/entities/warehouse.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { getDataFromDTO } from '../../utilities/functions/getDataFromDTO';
import { getDataFromEntity } from '../../utilities/functions/getDataFromEntity';

@Injectable()
export class OrdersService {
  constructor(
    private datasource: DataSource,

    @InjectRepository(Order)
    private orderRepository: Repository<Order>,

    @InjectRepository(OrderProduct)
    private orderProductRepository: Repository<OrderProduct>,

    private exportOrdersService: ExportOrdersService,

    private productsService: ProductsService,
  ){}

  // Tao don dat hang moi --> Tao cac item moi
  async create(createOrderDto: CreateOrderDto) {
    const order = new Order();

    getDataFromDTO(order, createOrderDto, true);
    order.status = OrderStatus.PROCESSING;

    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const savedOrder = await queryRunner.manager.save(order); 

      const listOrderProduct : OrderProduct[] = [];
      const listProductId : string[] = [];
      createOrderDto.listOrderProduct.forEach(async (orderProductDto) => {
        const orderProduct = new OrderProduct();
        
        getDataFromDTO(orderProduct, orderProductDto, true);
        orderProduct.orderId = savedOrder.id;

        listOrderProduct.push(orderProduct);
        listProductId.push(orderProductDto.productId);
      });

      const check = await this.productsService.existByListId(listProductId);

      if(check == false){
        throw new NotFoundException('Products not found');
      } else {
        const listSavedOrderProduct = await queryRunner.manager.save(listOrderProduct);
        await queryRunner.commitTransaction();

        savedOrder.listOrderProduct = listSavedOrderProduct;
        return savedOrder;
      }
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      
      throw new InternalServerErrorException();
    } finally {
      queryRunner.release();
    }
  }

  find(listWarehouseId: string[], listStatus: string[], sortBy: string[], orders: number[], limit: number, offset: number) {
    const query = this.orderRepository.createQueryBuilder('order')
                                      .innerJoin(Warehouse, 'warehouse', 'warehouse.id = order.warehouseId')
                                      .where(`(warehouse.id IN (${listWarehouseId}) OR order.requestedWarehouseId IN (${listWarehouseId}))`);

    if(listStatus != null && listStatus.length != 0){
      let s = '';
      listStatus.forEach((status, idx) => {
        if(idx + 1 != listStatus.length){
          s += `'${status}'` + ',';
        } else {
          s += `'${status}'`;
        }
      });
      query.andWhere(`order.status IN (${s})`)
    }

    if(sortBy != null){
      sortBy.forEach((key, idx) => {
        query.addOrderBy(`order.${key}`, orders[idx] == 1 ? "ASC" : "DESC")
      });
    }

    return query.innerJoinAndMapMany('order.listOrderProduct', OrderProduct, 'orderProduct', 'order.id = orderProduct.orderId')
                .limit(limit)
                .offset(offset)
                .getMany()
  }

  async findOne(id: string) {
    const order = await this.orderRepository.createQueryBuilder("order")
                                            .innerJoinAndMapMany("order.orderProducts", OrderProduct, "orderProduct", "order.id = orderProduct.orderId")
                                            .where(`order.id = ${id}`)
                                            .getOne();

    if(order == null){
      throw new NotFoundException('Order not found');
    } else {
      return order;
    }
  }

  async findRemainingInAnOrder(orderId: string){
    const listExportOrder = await this.exportOrdersService.findExportOrdersByOrder(orderId, true);
    console.log(listExportOrder);
    const order = await this.orderRepository.createQueryBuilder('order')
                                            .where(`order.id = ${orderId}`)
                                            .innerJoinAndMapMany('order.listRemainingOrderProduct', OrderProduct, 'orderProduct', 'order.id = orderProduct.orderId')
                                            .getOne();

    const getRemainingInAnOrder = new GetRemainingInAnOrder();
    getDataFromEntity(getRemainingInAnOrder, order);

    listExportOrder.forEach((exportOrder) => {
      exportOrder.listExportOrderItem.forEach((exportOrderItem) => {
        for(const idx in getRemainingInAnOrder.listRemainingOrderProduct){
          if(getRemainingInAnOrder.listRemainingOrderProduct[idx].productId == exportOrderItem.productId){
            getRemainingInAnOrder.listRemainingOrderProduct[idx].quantity -= exportOrderItem.quantity;
            break;
          }
        }
      });
    });

    return getRemainingInAnOrder;
  }

  findOrderProductsByOrder(orderId: string){
    return this.orderProductRepository.findBy({orderId: orderId});
  }

  // Cach xu ly: xoa het cai cu, them vao cai moi
  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.findOne(id);

    if(order!.status == OrderStatus.COMPLETED){
      throw new ConflictException();
    } else {
      getDataFromDTO(order, updateOrderDto, false);

      // Xoa het cai cu
      await this.orderProductRepository.createQueryBuilder('orderProduct')
                                      .delete()
                                      .where(`orderProduct.orderId = ${order!.id}`)
                                      .execute();

      const listOrderProduct : OrderProduct[] = [];
      const listProductId : string[] = [];

      updateOrderDto.listUpdateOrderProduct.forEach((updateOrderProductDto) => {
        const orderProduct = new OrderProduct();
        
        getDataFromDTO(orderProduct, updateOrderProductDto, true);
        if(orderProduct.order == null || orderProduct.order == undefined){
          orderProduct.orderId = order!.id;
        }

        listOrderProduct.push(orderProduct);
        listProductId.push(updateOrderProductDto.productId);
      });

      const isExisting = await this.productsService.existByListId(listProductId);

      if(isExisting == true){
        const queryRunner = this.datasource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
          const savedOrder = await queryRunner.manager.save(order!);
          await queryRunner.manager.save(listOrderProduct);
          await queryRunner.commitTransaction();

          return savedOrder;
        } catch (error) {
          console.log(error);
          await queryRunner.rollbackTransaction();
          throw new InternalServerErrorException();
        } finally {
          queryRunner.release();
        }
      } else {
        throw new NotFoundException('Products not found');
      }
    }
  }

  // Xoa don khi chua xuat kho
  async remove(id: string) {
    const order = await this.findOne(id);
    const listExportOrder = await this.exportOrdersService.findExportOrdersByOrder(order!.id, false);
    if(listExportOrder.length == 0){
      const listOrderProduct = await this.orderProductRepository.findBy({orderId: order!.id});

      const queryRunner = this.datasource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        await queryRunner.manager.remove(listOrderProduct!);
        const removedOrder = await queryRunner.manager.remove(order!);
        await queryRunner.commitTransaction();

        return removedOrder;
      } catch (error) {
        console.log(error);
        await queryRunner.rollbackTransaction();
        throw new InternalServerErrorException();
      } finally {
        queryRunner.release();
      }
    } else {
      throw new ConflictException();
    }
  }
}
