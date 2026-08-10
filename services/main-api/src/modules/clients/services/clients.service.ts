import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { Client, ClientDocument } from '../schemas/client.schema';

@Injectable()
export class ClientsService {
  constructor(
    @InjectModel(Client.name) private readonly clientModel: Model<ClientDocument>,
  ) {}

  create(dto: CreateClientDto) {
    return this.clientModel.create(dto);
  }

  findAll(search?: string) {
    const filter: Record<string, unknown> = { isActive: true };
    if (search) {
      filter.$text = { $search: search };
    }
    return this.clientModel.find(filter).sort({ createdAt: -1 });
  }

  async findOneOrFail(id: string): Promise<ClientDocument> {
    const client = await this.clientModel.findById(id);
    if (!client) {
      throw new NotFoundException(`Cliente con id '${id}' no encontrado`);
    }
    return client;
  }

  findOne(id: string) {
    return this.findOneOrFail(id);
  }

  async update(id: string, dto: UpdateClientDto) {
    const client = await this.findOneOrFail(id);
    Object.assign(client, dto);
    await client.save();
    return client;
  }

  async remove(id: string): Promise<void> {
    const client = await this.findOneOrFail(id);
    client.isActive = false;
    await client.save();
  }
}
