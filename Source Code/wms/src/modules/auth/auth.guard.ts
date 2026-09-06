import { 
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Request } from 'express';
import { IS_PUBLIC_KEY } from "../../utilities/custom_decorators/public.decorator";
import { ROLES_KEY } from "../../utilities/custom_decorators/roles.decorator";
import { UserRole } from "../users/entities/user.entity";
import { jwtConstants } from "./constants";
@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private reflector: Reflector,
    ){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        return true;
        const isPublic = this.reflector.getAllAndOverride<boolean>(
            IS_PUBLIC_KEY,
            [context.getHandler(), context.getClass(),],
        );

        if(isPublic){
            // console.log("is public");
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if(!token){
            throw new UnauthorizedException();
        }

        try{
            const payload = await this.jwtService.verifyAsync(
                token!,
                {secret: jwtConstants.secret},
            );

            // console.log("decode is: ");
            // console.log(this.jwtService.decode(token));
            
            request['user'] = payload;
        } catch(err) {
            console.log(err)
            throw new UnauthorizedException();
        }

        const { user } = context.switchToHttp().getRequest();

        if(user.role == UserRole.ADMIN){
            return true;
        } else {
            const requiredRoles = this.reflector.get<UserRole[]>(
                ROLES_KEY,
                context.getHandler(),
            );

            if(requiredRoles == undefined || request == null){
                return true;
            }

            // Tim trong requiredRoles xem co role nao ma user co hay khong, user role co the la mot mang
            if (requiredRoles.includes(user.role)){
                // console.log("include user role");
                return true;
            } else {
                throw new ForbiddenException();
            } 
        } 
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}