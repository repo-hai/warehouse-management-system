import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { Public } from '../../utilities/custom_decorators/public.decorator';
import { HttpExceptionDto } from '../../utilities/global_dto/http-exception.dto';
import { LoginDto } from './dto/login.dto';
import { ReturnAccessTokenDto } from './dto/return-access-token.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){}

    @Public()
    @Post('login')
    @ApiOkResponse({
        type: ReturnAccessTokenDto
    })
    @ApiNotFoundResponse({
        description: 'Not Found Exception',
        type: HttpExceptionDto,
        example: {
            "status": 404,
            "message": "Not Found"
        }
    })
    signIn(@Body() loginDto: LoginDto){
        return this.authService.signIn(loginDto);
    }
}
