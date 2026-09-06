import { SetMetadata } from "@nestjs/common";
import { UserRole } from "../../modules/users/entities/user.entity";

export const ROLES_KEY = 'roles';
export const Roles = (roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

export const AnyRole = () => SetMetadata(ROLES_KEY, [UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]);