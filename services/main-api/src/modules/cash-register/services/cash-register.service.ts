import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CloseRegisterDto } from '../dto/close-register.dto';
import { OpenRegisterDto } from '../dto/open-register.dto';
import { CashRegisterStatus } from '../enums/cash-register-status.enum';
import {
  CashRegisterSession,
  CashRegisterSessionDocument,
} from '../schemas/cash-register.schema';

@Injectable()
export class CashRegisterService {
  constructor(
    @InjectModel(CashRegisterSession.name)
    private readonly sessionModel: Model<CashRegisterSessionDocument>,
  ) {}

  async open(userId: string, dto: OpenRegisterDto) {
    const existingOpen = await this.sessionModel.findOne({
      status: CashRegisterStatus.OPEN,
    });
    if (existingOpen) {
      throw new BadRequestException(
        'Ya existe una caja abierta. Debe cerrarse antes de abrir una nueva.',
      );
    }

    return this.sessionModel.create({
      openedBy: userId,
      openingAmountInCents: dto.openingAmountInCents,
      expectedAmountInCents: dto.openingAmountInCents,
      status: CashRegisterStatus.OPEN,
      openedAt: new Date(),
      notes: dto.notes,
    });
  }

  async getOpenSession(): Promise<CashRegisterSessionDocument> {
    const session = await this.sessionModel.findOne({
      status: CashRegisterStatus.OPEN,
    });
    if (!session) {
      throw new BadRequestException(
        'No hay una caja abierta. Debe abrir una caja antes de registrar ventas.',
      );
    }
    return session;
  }

  async addToExpectedAmount(amountInCents: number): Promise<void> {
    const session = await this.getOpenSession();
    session.expectedAmountInCents += amountInCents;
    await session.save();
  }

  async close(userId: string, dto: CloseRegisterDto) {
    const session = await this.getOpenSession();

    session.closedBy = userId;
    session.closingAmountInCents = dto.closingAmountInCents;
    session.differenceInCents =
      dto.closingAmountInCents - session.expectedAmountInCents;
    session.status = CashRegisterStatus.CLOSED;
    session.closedAt = new Date();
    if (dto.notes) session.notes = dto.notes;

    await session.save();
    return session;
  }

  findAll() {
    return this.sessionModel.find().sort({ openedAt: -1 });
  }

  async findOne(id: string) {
    const session = await this.sessionModel.findById(id);
    if (!session) {
      throw new NotFoundException(`Sesión de caja '${id}' no encontrada`);
    }
    return session;
  }
}
