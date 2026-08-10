import { UserRole } from '../../users/enums/user-role.enum';

export interface JwtPayload {
  sub: string; // userId
  email: string;
  role: UserRole;
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: UserRole;
}
