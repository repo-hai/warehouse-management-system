import { Module } from '@nestjs/common';
import { suppliersService } from './suppliers.service';
import { SuppliersController } from './suppliers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supplier } from './entities/supplier.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Supplier])
  ],
  controllers: [SuppliersController],
  providers: [suppliersService],
  exports: [TypeOrmModule, suppliersService]
})
export class SuppliersModule {}
