import { Injectable } from '@nestjs/common';

import { InventoryApiClient } from '../clients/inventory-api.client';

@Injectable()
export class InventoryService {
  constructor(private readonly inventoryApiClient: InventoryApiClient) {}

  async checkHealth() {
    return this.inventoryApiClient.checkHealth();
  }
}
