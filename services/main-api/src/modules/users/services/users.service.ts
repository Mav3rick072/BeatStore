import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';

import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserStatus } from '../enums/user-status.enum';
import { User, UserDocument } from '../schemas/user.schema';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  private toResponse(user: UserDocument): UserResponseDto {
    return {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      status: user.status,
      employeeNumber: user.employeeNumber,
      phone: user.phone,
      createdAt: (user as any).createdAt,
      updatedAt: (user as any).updatedAt,
    };
  }

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.userModel.findOne({
      email: dto.email.toLowerCase(),
    });
    if (existing) {
      throw new ConflictException(
        `Ya existe un usuario registrado con el correo ${dto.email}`,
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const created = await this.userModel.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email.toLowerCase(),
      passwordHash,
      role: dto.role,
      employeeNumber: dto.employeeNumber,
      phone: dto.phone,
    });

    return this.toResponse(created);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userModel.find().sort({ createdAt: -1 });
    return users.map((u) => this.toResponse(u));
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.findOneOrFail(id);
    return this.toResponse(user);
  }

  async findOneOrFail(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException(`Usuario con id '${id}' no encontrado`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() });
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.findOneOrFail(id);

    if (dto.email && dto.email.toLowerCase() !== user.email) {
      const existing = await this.userModel.findOne({
        email: dto.email.toLowerCase(),
      });
      if (existing) {
        throw new ConflictException(
          `Ya existe un usuario registrado con el correo ${dto.email}`,
        );
      }
      user.email = dto.email.toLowerCase();
    }

    if (dto.firstName) user.firstName = dto.firstName;
    if (dto.lastName) user.lastName = dto.lastName;
    if (dto.role) user.role = dto.role;
    if (dto.employeeNumber !== undefined) user.employeeNumber = dto.employeeNumber;
    if (dto.phone !== undefined) user.phone = dto.phone;
    if (dto.password) {
      user.passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    }

    await user.save();
    return this.toResponse(user);
  }

  async setStatus(id: string, status: UserStatus): Promise<UserResponseDto> {
    const user = await this.findOneOrFail(id);
    user.status = status;
    await user.save();
    return this.toResponse(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOneOrFail(id);
    user.status = UserStatus.INACTIVE;
    await user.save();
  }

  async validateCredentials(
    email: string,
    password: string,
  ): Promise<UserDocument | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;
    const matches = await bcrypt.compare(password, user.passwordHash);
    return matches ? user : null;
  }
}
