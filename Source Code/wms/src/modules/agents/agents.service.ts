import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getDataFromDTO } from '../../utilities/functions/getDataFromDTO';
import { Agent } from './entities/agent.entity';
import { Order } from '../orders/entities/order.entity';
import { ExportOrder } from '../export-orders/entities/export-order.entity';

@Injectable()
export class AgentsService {
  constructor(
    @InjectRepository(Agent)
    private agentRepository: Repository<Agent>,
  ){}

  create(createAgentDto: CreateAgentDto) {
    const agent = new Agent();
    getDataFromDTO(agent, createAgentDto);

    return this.agentRepository.save(agent);
  }

  // async testTransaction(createAgentDto: CreateAgentDto){
  //   const queryRunner = this.dataSource.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();

  //   const agent = new Agent();
  //   getDataFromDTO(agent, createAgentDto);
  //   try {
  //     await queryRunner.manager.save(agent);

  //     console.log('start roll back');
  //     await queryRunner.rollbackTransaction();
  //     console.log('roll back ok');
  //   } catch(error){
  //     console.log(error);
  //     await queryRunner.rollbackTransaction();
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }

  find(limit: number, offset: number) {
    return this.agentRepository.find({take: limit, skip: offset});
  }

  findByAgentName(keyword: string, limit: number, offset: number){
    return this.agentRepository.createQueryBuilder('agent')
                                .limit(limit)
                                .offset(offset)
                                .where(`agent.name ILIKE '%${keyword}%'`)
                                .getMany();
  }

  async findRecentlyImportedAgents(warehouseId: string, limit: number, offset: number){
    const query = await this.agentRepository.createQueryBuilder('agent')
                                                    .addSelect('GREATEST(MAX(order.createdAt), MAX(exportOrder.createdAt)) AS lastUsed')
                                                    .innerJoin(Order, 'order', 'agent.id = order.agentId')
                                                    .innerJoin(ExportOrder, 'exportOrder', 'exportOrder.agentId = agent.id')
                                                    .where(`(order.warehouseId = ${warehouseId} OR exportOrder.warehouseId = ${warehouseId})`)
                                                    .groupBy('agent.id')
                                                    .orderBy('lastUsed', 'DESC')
                                                    .limit(limit)
                                                    .offset(offset);
    console.log(query.getQuery());
    return query.getMany();
  }

  async findOne(id: string) {
    const agent = await this.agentRepository.findOneBy({id: id});
    if(agent == null){
      throw new NotFoundException('Agent Not Found');
    } else{
      return agent;
    }
  }

  async update(id: string, updateAgentDto: UpdateAgentDto) {
    const agent = await this.findOne(id);
    getDataFromDTO(agent, updateAgentDto);

    return this.agentRepository.save(agent);
  }
}
