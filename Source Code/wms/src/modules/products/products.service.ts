import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product-category.dto';
import { ProductCategory } from './entities/product-category.entitiy';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { DeleteProductCategoryDto } from './dto/delete-product-category.dto';
import { WarehouseProduct } from '../warehouses/entities/warehouse-product.entity';
import { WarehouseProductBatch } from '../warehouses/entities/warehouse-product-batch.entity';
import { GetProductDto } from './dto/get-product.dto';
import { GetWarehouseProductBatchDto } from '../warehouses/dto/get-warehouse-product-batch.dto';
import { GetProductIncludeBatchsDto } from './dto/get-product-include-batchs.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { getDataFromDTO } from '../../utilities/functions/getDataFromDTO';
import { parseObjectDataWithoutIdField } from '../../utilities/functions/parseObjectDataWithoutIdFileld';
import { Product } from './entities/product.entity';
import { ExportOrderItem } from '../export-orders/entities/export-order-item.entity';
import { OrderProduct } from '../orders/entities/order-product.entity';
import { getDataFromEntity } from '../../utilities/functions/getDataFromEntity';

@Injectable()
export class ProductsService {
  constructor(
    private dataSource: DataSource,

    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    @InjectRepository(ProductCategory)
    private productCategoryRepository: Repository<ProductCategory>,
  ){}

  async create(createProductDto: CreateProductDto) {
    const product = new Product();
    parseObjectDataWithoutIdField(product, createProductDto);

    // Khoi tao transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try{
      const savedProduct = await queryRunner.manager.save(product);

      const listProductCategory : ProductCategory[] = [];
      createProductDto.listCategoryId!.forEach((categoryId) => {
        const productCategory = new ProductCategory();
        productCategory.categoryId = categoryId;
        productCategory.productId = savedProduct!.id;

        listProductCategory.push(productCategory);
      });

      if(listProductCategory.length != 0){
        await queryRunner.manager.save(listProductCategory);
      }
      await queryRunner.commitTransaction();

      return savedProduct;
    } catch (error){
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }

  createProductCategory(createProductCategoryDto: CreateProductCategoryDto){
    const productCategory = new ProductCategory();
    productCategory.categoryId = createProductCategoryDto.categoryId;
    productCategory.productId = createProductCategoryDto.productId;

    return this.productCategoryRepository.save(productCategory);
  }

  find(limit: number, offset: number) {
    return this.productRepository.find({take: limit, skip: offset});
  }

  async findOne(id: string){
    const product = await this.productRepository.findBy({id: id});

    if(product == null){
      throw new NotFoundException('Product not found');
    } else {
      return product;
    }
  }

  findByProductName(keyword: string, limit: number, offset: number) {
    return this.productRepository.createQueryBuilder('product')
                                  .where(`product.name ILIKE '%${keyword}%'`)
                                  .orderBy('product.id', 'ASC')
                                  .limit(limit)
                                  .offset(offset)
                                  .getMany();
  }

  async existByListId(listProductId: string[]){
    const listProduct = await this.productRepository.createQueryBuilder()
                                                    .whereInIds(listProductId)
                                                    .getMany();
    if(listProduct.length != listProductId.length){
      return false;
    } else {
      return true;
    }
  }

  async findOneOfWarehouse(productId: string, warehouseId: string, getAvailableStock: boolean) {
    if(getAvailableStock == false){
      return this.productRepository.createQueryBuilder('product')
                                    .innerJoin(WarehouseProduct, 'warehouseProduct', 'product.id = warehouseProduct.productId')
                                    .where(`warehouseProduct.warehouseId = ${warehouseId}`)
                                    .andWhere(`product.id = ${productId}`)
                                    .getOne();
    } else {
      const queryResults = await this.productRepository.createQueryBuilder('product')
                                                        .addSelect('SUM(warehouseProductBatch.availableStock)', 'totalAvailableStock')
                                                        .innerJoin(WarehouseProduct, 'warehouseProduct', 'warehouseProduct.productId = product.id')
                                                        .innerJoin(WarehouseProductBatch, 'warehouseProductBatch', 'warehouseProduct.productId = warehouseProductBatch.productId AND warehouseProduct.warehouseId = warehouseProductBatch.warehouseId')
                                                        .groupBy('product.id')
                                                        .where(`productId = ${productId}`)
                                                        .andWhere(`warehouseProduct.warehouseId = ${warehouseId}`)
                                                        .execute();
      queryResults.forEach((queryResult) => {
        const getProductDto = new GetProductDto();
        getProductDto.id = queryResult.productId;
        getProductDto.name = queryResult.productName;
        getProductDto.dimension = queryResult.productDimension;
        getProductDto.weight = queryResult.productWeight;
        getProductDto.description = queryResult.productDescription;
        getProductDto.totalAvailableStock = queryResult.totalAvailableStock;

        return getProductDto;
      });
    }
  }

  async findProductsOfWarehouse(warehouseId: string, limit: number, offset: number, getAvailableStock: boolean, orderByProductName: "ASC" | "DESC"){
    if(getAvailableStock == false){
      return this.productRepository.createQueryBuilder('product')
                                    .innerJoin(WarehouseProduct, 'warehouseProduct', 'warehouseProduct.productId = product.id')
                                    .where(`warehouseProduct.warehouseId = ${warehouseId}`)
                                    .limit(limit)
                                    .offset(offset)
                                    .orderBy('product.name', orderByProductName)
                                    .getMany();
    } else {
      const queryResults = await this.productRepository.createQueryBuilder('product')
                                                        .addSelect('SUM(warehouseProductBatch.availableStock)', 'totalAvailableStock')
                                                        .innerJoin(WarehouseProduct, 'warehouseProduct', 'warehouseProduct.productId = product.id')
                                                        .innerJoin(WarehouseProductBatch, 'warehouseProductBatch', 'warehouseProduct.productId = warehouseProductBatch.productId AND warehouseProduct.warehouseId = warehouseProductBatch.warehouseId')
                                                        .where(`warehouseProduct.warehouseId = ${warehouseId}`)
                                                        .orderBy('product.name', orderByProductName)
                                                        .groupBy('product.id')
                                                        .limit(limit)
                                                        .offset(offset)
                                                        .execute();
      const listGetProductDto : GetProductDto[] = [];
      queryResults.forEach((queryResult) => {
        const getProductDto = new GetProductDto();
        getProductDto.id = queryResult.productId;
        getProductDto.name = queryResult.productName;
        getProductDto.dimension = queryResult.productDimension;
        getProductDto.weight = queryResult.productWeight;
        getProductDto.description = queryResult.productDescription;
        getProductDto.totalAvailableStock = queryResult.totalAvailableStock;

        listGetProductDto.push(getProductDto);
      });

      return listGetProductDto;
    }
  }
  
  async findProductsOfWarehouseByName(warehouseId: string, keyword: string, limit: number, offset: number, getAvailableStock: boolean){
    if(getAvailableStock == false){
      return this.productRepository.createQueryBuilder('product')
                                    .innerJoin(WarehouseProduct, 'warehouseProduct', 'warehouseProduct.productId = product.id')
                                    .where(`warehouseProduct.warehouseId = ${warehouseId}`)
                                    .andWhere(`product.name ILIKE '%${keyword}%'`)
                                    .limit(limit)
                                    .offset(offset)
                                    .getMany();
    } else {
      const queryResults = await this.productRepository.createQueryBuilder('product')
                                                        .addSelect('SUM(warehouseProductBatch.availableStock)', 'totalAvailableStock')
                                                        .innerJoin(WarehouseProduct, 'warehouseProduct', 'warehouseProduct.productId = product.id')
                                                        .innerJoin(WarehouseProductBatch, 'warehouseProductBatch', 'warehouseProduct.productId = warehouseProductBatch.productId AND warehouseProduct.warehouseId = warehouseProductBatch.warehouseId')
                                                        .where(`warehouseProduct.warehouseId = ${warehouseId}`)
                                                        .andWhere(`product.name ILIKE '%${keyword}%'`)
                                                        .groupBy('product.id')
                                                        .limit(limit)
                                                        .offset(offset)
                                                        .execute();
      const listGetProductDto : GetProductDto[] = [];
      queryResults.forEach((queryResult) => {
        const getProductDto = new GetProductDto();
        getProductDto.id = queryResult.productId;
        getProductDto.name = queryResult.productName;
        getProductDto.dimension = queryResult.productDimension;
        getProductDto.weight = queryResult.productWeight;
        getProductDto.description = queryResult.productDescription;
        getProductDto.totalAvailableStock = queryResult.totalAvailableStock;

        listGetProductDto.push(getProductDto);
      });

      return listGetProductDto;
    }
  }

  async findRecentlyUsedProducts(warehouseId: string, limit: number, offset: number){
    return this.productRepository.createQueryBuilder('product')
                                  .innerJoin(WarehouseProduct, 'warehouseProduct', 'warehouseProduct.productId = product.id')
                                  .leftJoin(ExportOrderItem, 'exportOrderItem', 'exportOrderItem.productId = product.id')
                                  .leftJoin(OrderProduct, 'orderProduct', 'orderProduct.productId = product.id')
                                  .where(`warehouseProduct.warehouseId = ${warehouseId}`)
                                  .groupBy('product.id')
                                  .limit(limit)
                                  .offset(offset)
                                  .getMany();
  }

  findProductsByCategories(listCategoryId: string[], limit: number, offset: number){
    return this.productRepository.createQueryBuilder('product')
                                .innerJoin(ProductCategory, 'productCategory', 'productCategory.productId = product.id')
                                .where(`category.id IN (${listCategoryId})`)
                                .limit(limit)
                                .offset(offset)
                                .getMany();
  }

  async findOneProductIncludeProductBatchs(productId: string, warehouseId: string){
    const getProductIncludeBatchsDto = new GetProductIncludeBatchsDto();

    const queryResult = await this.productRepository.createQueryBuilder('product')
                                                      .innerJoin(WarehouseProduct, 'warehouseProduct', 'product.id = warehouseProduct.productId')
                                                      .innerJoinAndMapMany('product.listWarehouseProductBatch' , WarehouseProductBatch, 'warehouseProductBatch', 'warehouseProduct.warehouseId = warehouseProductBatch.warehouseId AND warehouseProduct.productId = warehouseProductBatch.productId')
                                                      .where(`product.id = ${productId}`)
                                                      .andWhere(`warehouseProduct.warehouseId = ${warehouseId}`)
                                                      .orderBy('warehouseProductBatch.expiredAt', 'ASC')
                                                      .getOne();

    getProductIncludeBatchsDto.id = queryResult!.id;
    getProductIncludeBatchsDto.name = queryResult!.name; 
    getProductIncludeBatchsDto.weight = queryResult!.weight; 
    getProductIncludeBatchsDto.dimension = queryResult!.dimension;                                                                 
    getProductIncludeBatchsDto.description = queryResult!.description; 
    let totalAvailableStock = 0;
    let totalStock = 0;

    getProductIncludeBatchsDto.listBatchs = [];

    queryResult!['listWarehouseProductBatch'].forEach((warehouseProductBatch) => {
      const getWarehouseProductBatchDto = new GetWarehouseProductBatchDto();
      getDataFromEntity(getWarehouseProductBatchDto, warehouseProductBatch);
      totalAvailableStock += warehouseProductBatch.availableStock;
      totalStock += warehouseProductBatch.stock;

      getProductIncludeBatchsDto.listBatchs.push(getWarehouseProductBatchDto);
    });

    getProductIncludeBatchsDto.totalAvailableStock = totalAvailableStock;
    getProductIncludeBatchsDto.totalStock = totalStock;

    return getProductIncludeBatchsDto;
  }

  async findListProductIncludeProductBatchs(listProductId: string[], warehouseId: string){
    const listGetProductIncludeBatchsDto : GetProductIncludeBatchsDto[] = [];

    const queryResults = await this.productRepository.createQueryBuilder('product')
                                                      .innerJoin(WarehouseProduct, 'warehouseProduct', 'product.id = warehouseProduct.productId')
                                                      .innerJoinAndMapMany('product.listWarehouseProductBatch' , WarehouseProductBatch, 'warehouseProductBatch', 'warehouseProduct.warehouseId = warehouseProductBatch.warehouseId AND warehouseProduct.productId = warehouseProductBatch.productId')
                                                      .where(`product.id IN (${listProductId})`)
                                                      .andWhere(`warehouseProduct.warehouseId = ${warehouseId}`)
                                                      .orderBy('warehouseProductBatch.expiredAt', 'ASC')
                                                      .getMany();

    queryResults.forEach((queryResult) => {
      const getProductIncludeBatchsDto = new GetProductIncludeBatchsDto();

      getProductIncludeBatchsDto.id = queryResult.id;
      getProductIncludeBatchsDto.name = queryResult.name; 
      getProductIncludeBatchsDto.weight = queryResult.weight; 
      getProductIncludeBatchsDto.dimension = queryResult.dimension;                                                                 
      getProductIncludeBatchsDto.description = queryResult.description; 
      let totalAvailableStock = 0;
      let totalStock = 0;

      getProductIncludeBatchsDto.listBatchs = [];

      queryResult['listWarehouseProductBatch'].forEach((warehouseProductBatch) => {
        const getWarehouseProductBatchDto = new GetWarehouseProductBatchDto();
        getDataFromEntity(getWarehouseProductBatchDto, warehouseProductBatch);
        totalAvailableStock += warehouseProductBatch.availableStock;
        totalStock += warehouseProductBatch.stock;

        getProductIncludeBatchsDto.listBatchs.push(getWarehouseProductBatchDto);
      });

      getProductIncludeBatchsDto.totalAvailableStock = totalAvailableStock;
      getProductIncludeBatchsDto.totalStock = totalStock;

      listGetProductIncludeBatchsDto.push(getProductIncludeBatchsDto);
    });

    return listGetProductIncludeBatchsDto;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);

    getDataFromDTO(product, updateProductDto);

    return this.productRepository.save(product!);
  }

  deleteProductCategories(deleteProductCategoryDto: DeleteProductCategoryDto){
    const listProductCategory : ProductCategory[] = [];

    deleteProductCategoryDto.listProductId.forEach((productId) => {
      const productCategory = new ProductCategory();
      productCategory.categoryId = deleteProductCategoryDto.categoryId;
      productCategory.productId = productId;

      listProductCategory.push(productCategory);
    });

    return this.productCategoryRepository.remove(listProductCategory);
  }

  deleteProductCategoriesByCategory(categoryId: string){
    return this.productCategoryRepository.createQueryBuilder('productCategory')
                                          .delete()
                                          .where(`categoryId = ${categoryId}`)
                                          .execute();
  }
}
