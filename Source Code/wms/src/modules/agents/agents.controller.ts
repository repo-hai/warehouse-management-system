import { Controller, Get, Post, Body, Patch, Param, Query, ParseIntPipe, ParseArrayPipe } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiHeader, ApiNotFoundResponse, ApiOkResponse } from '@nestjs/swagger';
import { Agent } from './entities/agent.entity';
import { UserRole } from '../users/entities/user.entity';
import { Roles } from '../../utilities/custom_decorators/roles.decorator';
import { HttpExceptionDto } from '../../utilities/global_dto/http-exception.dto';

@ApiHeader({
  name: 'authorization',
  description: 'Bearer token',
})
@ApiBearerAuth()
@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post()
  @Roles([UserRole.MANAGER])
  @ApiCreatedResponse({
    type: Agent
  })
  create(@Body() createAgentDto: CreateAgentDto) {
    return this.agentsService.create(createAgentDto);
  }

  // @Post('test')
  // @Roles([UserRole.MANAGER])
  // @ApiCreatedResponse({
  //   type: Agent
  // })
  // createByListAgent(@Body() createAgentDto: CreateAgentDto) {
  //   return this.agentsService.testTransaction(createAgentDto);
  // }

  @Get()
  @ApiOkResponse({
    type: [Agent]
  })
  find(
    @Query('limit', ParseIntPipe) limit: number,
    @Query('offset', ParseIntPipe) offset: number,
  ){
    return this.agentsService.find(limit, offset);
  }

  @Get(':id')
  @ApiOkResponse({
    type: Agent
  })
  @ApiNotFoundResponse({
    description: 'Not Found Exception',
    type: HttpExceptionDto,
    example: {
      "status": 404,
      "message": "Not Found"
    }
  })
  findOne(@Param('id') id: string) {
    return this.agentsService.findOne(id);
  }

  @Get('options/recentlyImported')
  @ApiOkResponse({
    type: [Agent]
  })
  findRecentlyImportedAgents(
    @Query('warehouseId') warehouseId: string,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('offset', ParseIntPipe) offset: number,
  ){
    return this.agentsService.findRecentlyImportedAgents(warehouseId, limit, offset);
  }

  @Get('options/findingByAgentName')
  @ApiOkResponse({
    type: [Agent]
  })  
  findByAgentName(
    @Query('keyword') keyword: string,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('offset', ParseIntPipe) offset: number,
  ){
    return this.agentsService.findByAgentName(keyword, limit, offset);
  }

  @Patch(':id')
  @Roles([UserRole.MANAGER])
  @ApiOkResponse({
    type: Agent
  })
  @ApiNotFoundResponse({
    description: 'Not Found Exception',
    type: HttpExceptionDto,
    example: {
      "status": 404,
      "message": "Not Found"
    }
  })
  update(
    @Param('id') id: string, 
    @Body() updateAgentDto: UpdateAgentDto
  ) {
    return this.agentsService.update(id, updateAgentDto);
  }
}
