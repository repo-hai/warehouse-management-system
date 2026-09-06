import { Controller, Get, Post, Body, Patch, Param, Query, BadRequestException, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiHeader, ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { Roles } from '../../utilities/custom_decorators/roles.decorator';
import { HttpExceptionDto } from '../../utilities/global_dto/http-exception.dto';
import { UserRole, User } from './entities/user.entity';

@ApiHeader({
  name: 'authorization',
  description: 'Bearer token',
})
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @Roles([UserRole.ADMIN])
  @ApiCreatedResponse({
    type: User
  })
  createByAdmin(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('employees')
  @Roles([UserRole.MANAGER])
  @ApiCreatedResponse({
    type: User
  })
  createByManager(@Body() createUserDto: CreateUserDto) {
    if(createUserDto.role == UserRole.ADMIN){
      throw new BadRequestException();
    } else {
      return this.usersService.create(createUserDto);
    }
  }

  @Get('')
  @Roles([UserRole.MANAGER])
  @ApiOkResponse({
    type: [User]
  })
  find(
    @Query('limit', ParseIntPipe) limit: number,
    @Query('offset', ParseIntPipe) offset: number,
  ){
    return this.usersService.find(limit, offset);
  }

  @Get(':id')
  @ApiOkResponse({
    type: User
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
    return this.usersService.findOne(id);
  }

  @Get('options/findingByUserName')
  @Roles([UserRole.MANAGER])
  @ApiOkResponse({
    type: [User]
  })
  findByUserName(
    @Query('keyword') keyword: string,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('offset', ParseIntPipe) offset: number,
  ){
    return this.usersService.findByUserName(keyword, limit, offset);
  }

  @Patch('employees/:id')
  @Roles([UserRole.MANAGER])
  @ApiOkResponse({
    type: User
  })
  @ApiNotFoundResponse({
    description: 'Not Found Exception',
    type: HttpExceptionDto,
    example: {
      "status": 404,
      "message": "Not Found"
    }
  })
  updateByManager(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    if(updateUserDto.role! == UserRole.ADMIN){
      throw new BadRequestException();
    } else {
      return this.usersService.update(id, updateUserDto);
    }
  }

  @Patch(':id')
  @Roles([UserRole.ADMIN])
  @ApiOkResponse({
    type: User
  })
  @ApiNotFoundResponse({
    description: 'Not Found Exception',
    type: HttpExceptionDto,
    example: {
      "status": 404,
      "message": "Not Found"
    }
  })
  updateByAdmin(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }
}
