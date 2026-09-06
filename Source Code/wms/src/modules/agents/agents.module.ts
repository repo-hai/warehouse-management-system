import { forwardRef, Module } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { AgentsController } from './agents.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent } from './entities/agent.entity';
import { OrdersModule } from '../orders/orders.module';
import { ExportOrdersModule } from '../export-orders/export-orders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Agent
    ]),
    forwardRef(() => ExportOrdersModule),
    forwardRef(() => OrdersModule),
  ],
  controllers: [AgentsController],
  providers: [AgentsService],
  exports: [TypeOrmModule, AgentsService]
})
export class AgentsModule {}
