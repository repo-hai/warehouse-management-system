import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { getDataFromDTO } from '../../utilities/functions/getDataFromDTO';
import { Category } from './entities/category.entity';
import { ProductCategory } from '../products/entities/product-category.entitiy';

@Injectable()
export class CategoriesService {
  constructor(
    private dataSource: DataSource,

    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ){}

  create(createCategoryDto: CreateCategoryDto) {
    const category = new Category();
    getDataFromDTO(category, createCategoryDto);

    return this.categoryRepository.save(category!);
  }

  find(limit: number, offset: number) {
    return this.categoryRepository.find({skip: offset, take: limit});
  }
  
  findByCategoryName(keyword: string, limit: number, offset: number){
    return this.categoryRepository.createQueryBuilder('category')
                                  .limit(limit)
                                  .offset(offset)
                                  .where(`category.name ILIKE '%${keyword}}%'`)
                                  .getMany();
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findOneBy({id: id});

    if(category == null){
      throw new NotFoundException('Category not found');
    } else {
      return category;
    }
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(id);
    getDataFromDTO(category, updateCategoryDto);

    return this.categoryRepository.save(category);
  }

  async remove(id: string) {
    const category = await this.findOne(id);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try{
      // await queryRunner.manager.createQueryBuilder().delete().from(ProductCategory, 'productCategory').where(`productCategory.categoryId = ${category.id}`).execute();
      await queryRunner.manager.delete(ProductCategory, {categoryId: category.id});
      const removeResult = await queryRunner.manager.remove(category);
      await queryRunner.commitTransaction();
      
      return removeResult;
    } catch (error){
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }
}
