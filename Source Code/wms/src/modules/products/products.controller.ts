import { Controller, Get, Post, Body, Patch, Param, Query, Delete, ParseArrayPipe, Inject, ParseIntPipe, ParseBoolPipe, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product-category.dto';
import { Product } from './entities/product.entity';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { DeleteProductCategoryDto } from './dto/delete-product-category.dto';
import { GetProductIncludeBatchsDto } from './dto/get-product-include-batchs.dto';
import { ApiHeader, ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { AnyRole } from '../../utilities/custom_decorators/roles.decorator';
import { HttpExceptionDto } from '../../utilities/global_dto/http-exception.dto';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { isBigIntInDatabase } from '../../utilities/functions/isBigIntInDatabase';

@ApiHeader({
  name: 'authorization',
  description: 'Bearer token',
})
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,

    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  @Post()
  @ApiCreatedResponse({
    description: 'Product created',
    type: Product,
  })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Post('categories')
  @ApiCreatedResponse({
    description: 'Product had been added to the categories',
    type: Product,
  })
  createProductCategory(@Body() createProductCategoryDto: CreateProductCategoryDto) {
    return this.productsService.createProductCategory(createProductCategoryDto);
  }

  @Get()
  @AnyRole()
  @ApiOkResponse({
    type: [Product]
  })
  async find(
    @Query('limit', ParseIntPipe) limit: number, 
    @Query('offset', ParseIntPipe) offset: number
  ) {
    return this.productsService.find(limit, offset);
  }

  @Get(':id')
  @ApiOkResponse({
    type: Product
  })
  @ApiNotFoundResponse({
    description: 'Not Found Exception',
    type: HttpExceptionDto,
    example: {
      "status": 404,
      "message": "Not Found"
    }
  })
  findOne(
    @Param('id') id: string,
  ) {
    if(isBigIntInDatabase(id) == true){
      return this.productsService.findOne(id);
    } else {
      throw new BadRequestException();
    }
  }

  @Get(':id/ofWarehouse/:warehouseId')
  @ApiOkResponse({
    type: Product
  })
  async findOneProductOfWarehouse(
    @Param('id') id: string,
    @Param('warehouseId') warehouseId: string,
    @Query('getAvailableStock', ParseBoolPipe) getAvailableStock: boolean,
  ) {
    if(getAvailableStock == true){
      const cacheKey = `product.${id}.OfWarehouse.${warehouseId}.getAvailableStock.${getAvailableStock}`
      const cacheValue = await this.cacheManager.get(cacheKey);
      
      if(cacheValue == undefined){
        const product = await this.productsService.findOneOfWarehouse(id, warehouseId, getAvailableStock);
        await this.cacheManager.set(cacheKey, product);

        return product;
      }

      return cacheValue;
    } else {
      return this.productsService.findOneOfWarehouse(id, warehouseId, getAvailableStock);
    }
  }

  @Get('ofWarehouses/:warehouseId')
  @ApiOkResponse({
    type: [Product]
  })
  async findProductsOfWarehouse(
    @Param('warehouseId') warehouseId: string,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('offset', ParseIntPipe) offset: number,
    @Query('getAvailableStock', ParseBoolPipe) getAvailableStock: boolean,
    @Query('orderByProductName') orderByProductName: "ASC" | "DESC",
  ){
    const cacheKey = `productsOfWarehouse.${warehouseId}.limit.${limit}.offset.${offset}.getStock.${getAvailableStock}.orderByProductName${orderByProductName}`;
    const cacheValue = await this.cacheManager.get(cacheKey);
    
    if(cacheValue == undefined){
      const listProduct = await this.productsService.findProductsOfWarehouse(warehouseId, limit, offset, getAvailableStock, orderByProductName);
      await this.cacheManager.set(cacheKey, listProduct);

      return listProduct;
    }

    return cacheValue;
  }

  @Get('options/findingByProductName')
  @ApiOkResponse({
    type: [Product]
  })
  findByProductName(
    @Query('keyword') keyword: string,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('offset', ParseIntPipe) offset: number,
  ){
    return this.productsService.findByProductName(keyword, limit, offset);
  }

  @Get('options/recentlyUsed')
  @ApiOkResponse({
    type: [Product]
  })
  findRecentlyUsedProducts(
    @Query('warehouseId') warehouseId: string,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('offset', ParseIntPipe) offset: number,
  ){
    return this.productsService.findRecentlyUsedProducts(warehouseId, limit, offset);
  }

  @Get('options/findingByCategories')
  @ApiOkResponse({
    type: [Product]
  })
  findProductsByCategories(
    @Query('limit', ParseIntPipe) limit: number,
    @Query('offset', ParseIntPipe) offset: number,
    @Query('listCategoryId', ParseArrayPipe) listCategoryId: string[]
  ){
    return this.productsService.findProductsByCategories(listCategoryId, limit, offset)
  }

  @Get('ofWarehouses/:warehouseId/findingByProductName')
  @ApiOkResponse({
    type: [Product]
  })
  findProductsOfWarehouseByName(
    @Query('keyword') keyword: string,
    @Param('warehouseId') warehouseId: string,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('offset', ParseIntPipe) offset: number,
    @Query('getAvailableStock', ParseBoolPipe) getAvailableStock: boolean,
  ){
    return this.productsService.findProductsOfWarehouseByName(warehouseId, keyword, limit, offset, getAvailableStock)
  }

  @Get(':productId/ofWarehouses/:warehouseId/options/includingProductBatchs')
  @ApiOkResponse({
    type: GetProductIncludeBatchsDto
  })
  findOneProductIncludeProductBatchs(
    @Param('productId') productId: string,
    @Param('warehouseId') warehouseId: string,
  ){
    return this.productsService.findOneProductIncludeProductBatchs(productId, warehouseId);
  }

  @Get('ofWarehouses/:warehouseId/options/includingProductBatchs')
  @ApiOkResponse({
    type: [GetProductIncludeBatchsDto]
  })
  findListProductIncludeProductBatchs(
    @Query('listProductId', ParseArrayPipe) listProductId: string[],
    @Param('warehouseId') warehouseId: string,
  ){
    return this.productsService.findListProductIncludeProductBatchs(listProductId, warehouseId);
  }

  @Patch(':id')
  @ApiOkResponse({
    type: Product
  })
  @ApiNotFoundResponse({
    description: 'Not Found Exception',
    type: HttpExceptionDto,
    example: {
      "status": 404,
      "message": "Not Found"
    }
  })
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    const updatedProduct = await this.productsService.update(id, updateProductDto);
    await this.cacheManager.clear();

    return updatedProduct;
  }

  @Delete('categories')
  @ApiOkResponse({
    type: DeleteProductCategoryDto
  })
  @ApiNotFoundResponse({
    description: 'Not Found Exception',
    type: HttpExceptionDto,
    example: {
      "status": 404,
      "message": "Not Found"
    }
  })
  deleteProductCategories(@Body() deleteProductCategoryDto: DeleteProductCategoryDto){
    return this.productsService.deleteProductCategories(deleteProductCategoryDto);
  }

}
