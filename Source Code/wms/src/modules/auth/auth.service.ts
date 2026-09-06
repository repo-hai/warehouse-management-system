import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { WarehousesService } from '../warehouses/warehouses.service';
import { ReturnAccessTokenDto } from './dto/return-access-token.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from '../../utilities/custom_decorators/public.decorator';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        
        private usersService: UsersService,
        private warehousesService: WarehousesService,
    ){}
    
    @Public()
    async signIn(
        loginDto: LoginDto
    ): Promise<ReturnAccessTokenDto>{
        const user = await this.usersService.findOneByUsernameAndPassword(loginDto);

        if (user === null){
            throw new NotFoundException('Username/password wrong');
        }

        const warehouseEmployee = await this.warehousesService.findOneWarehouseEmployee(user!.id);

        const payload = {userId: user.id, role: user.role, warehouseId: warehouseEmployee!.warehouseId};

        const returnAccessTokenDto = new ReturnAccessTokenDto();
        returnAccessTokenDto.accessToken = await this.jwtService.signAsync(payload);
        return returnAccessTokenDto;
    }
}
