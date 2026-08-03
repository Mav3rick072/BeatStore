import { UserRole } from '../enums/user-role.enum';
import { UserStatus } from '../enums/user-status.enum';

export interface IUser {
  id?: string;

  firstName: string;

  lastName: string;

  email: string;

  passwordHash: string;

  role: UserRole;

  status: UserStatus;

  employeeNumber?: string;

  phone?: string;

  createdAt?: Date;

  updatedAt?: Date;
}
