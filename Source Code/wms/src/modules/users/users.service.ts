import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WarehouseEmployee } from '../warehouses/entities/warehouse-employee.entity';
import { LoginDto } from '../auth/dto/login.dto';
import { getDataFromDTO } from '../../utilities/functions/getDataFromDTO';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ){}

  create(createUserDto: CreateUserDto) {
    const user = new User();
    getDataFromDTO(user, createUserDto);

    return this.userRepository.save(user);
  }

  find(limit: number, offset: number) {
    return this.userRepository.find({take: limit, skip: offset, order: {role: "ASC"}});
  }

  findByUserName(keyword: string, limit: number, offset: number){
    return this.userRepository.createQueryBuilder('user')
                              .andWhere(`user.name ILKIE '%${keyword}%'`)
                              .orderBy('user.role')
                              .limit(limit)
                              .offset(offset)
                              .getMany();
  }

  findOneByUsernameAndPassword(loginDto: LoginDto){
    return this.userRepository.findOneBy({username: loginDto.username, password: loginDto.password});
  }

  findWarehouseStaffs(limit: number, offset: number){
    return this.userRepository.createQueryBuilder('user')
                              .where(`user.role = '${UserRole.STAFF}'`)
                              .orderBy('user.id', 'ASC')
                              .limit(limit)
                              .offset(offset)
                              .getMany();
  }

  findWarehouseStaffsByWarehouse(warehouseId: string, limit: number, offset: number){
    return this.userRepository.createQueryBuilder('user')
                              .innerJoin(WarehouseEmployee, 'warehouseEmployee', 'warehouseEmployee.employeeId = user.id')
                              .andWhere(`user.role = '${UserRole.STAFF}'`)
                              .where(`warehouseEmployee.warehouseId = ${warehouseId}`)
                              .orderBy('user.id', 'ASC')
                              .limit(limit)
                              .offset(offset)
                              .getMany();
  }

  findWarehouseStaffsByName(warehouseId: string, keyword: string, limit: number, offset: number){
    return this.userRepository.createQueryBuilder('user')
                              .innerJoin(WarehouseEmployee, 'warehouseEmployee', 'warehouseEmployee.employeeId = user.id')
                              .where(`user.role = ${UserRole.STAFF}`)
                              .andWhere(`warehouseId = ${warehouseId}`)
                              .andWhere(`user.name ILKIE '%${keyword}%'`)
                              .limit(limit)
                              .offset(offset)
                              .getMany();
  }

  findManagers(limit: number, offset: number){
    return this.userRepository.createQueryBuilder()
                              .where(`role = ${UserRole.MANAGER}`)
                              .orderBy('user.id', 'ASC')
                              .limit(limit)
                              .offset(offset)
                              .getMany();
  }

  findManagersByWarehouse(warehouseId: string,limit: number, offset: number){
    return this.userRepository.createQueryBuilder()
                              .where(`warehouseId = ${warehouseId}`)
                              .andWhere(`role = '${UserRole.MANAGER}'`)
                              .orderBy('user.id', 'ASC')
                              .limit(limit)
                              .offset(offset)
                              .getMany();
  }

  async findOne(id: string){
    const user = await this.userRepository.findOneBy({id: id});
    
    if(user == null){
      throw new NotFoundException('User not found');
    } else {
      return user;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    getDataFromDTO(user, updateUserDto);

    return this.userRepository.save(user);
  }
}
