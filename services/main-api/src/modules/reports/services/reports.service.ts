import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Sale, SaleDocument } from '../../sales/schemas/sale.schema';
import { SaleStatus } from '../../sales/enums/sale-status.enum';
import { SaleReturn, ReturnDocument } from '../../returns/schemas/return.schema';

interface DateRange {
  from?: string;
  to?: string;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Sale.name) private readonly saleModel: Model<SaleDocument>,
    @InjectModel(SaleReturn.name)
    private readonly returnModel: Model<ReturnDocument>,
  ) {}

  private buildDateFilter(range: DateRange) {
    const filter: Record<string, unknown> = {};
    if (range.from || range.to) {
      filter.createdAt = {};
      if (range.from) (filter.createdAt as any).$gte = new Date(range.from);
      if (range.to) (filter.createdAt as any).$lte = new Date(range.to);
    }
    return filter;
  }

  async salesSummary(range: DateRange) {
    const filter = {
      ...this.buildDateFilter(range),
      status: { $in: [SaleStatus.COMPLETED, SaleStatus.PARTIALLY_RETURNED, SaleStatus.RETURNED] },
    };

    const [summary] = await this.saleModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenueInCents: { $sum: '$totalInCents' },
          totalDiscountInCents: { $sum: '$discountInCents' },
          totalItemsSold: { $sum: { $sum: '$items.quantity' } },
        },
      },
    ]);

    const totalReturned = await this.returnModel.aggregate([
      { $match: this.buildDateFilter(range) },
      { $group: { _id: null, totalRefundedInCents: { $sum: '$totalRefundedInCents' } } },
    ]);

    return {
      totalSales: summary?.totalSales ?? 0,
      totalRevenueInCents: summary?.totalRevenueInCents ?? 0,
      totalDiscountInCents: summary?.totalDiscountInCents ?? 0,
      totalItemsSold: summary?.totalItemsSold ?? 0,
      totalRefundedInCents: totalReturned[0]?.totalRefundedInCents ?? 0,
    };
  }

  async salesByDay(range: DateRange) {
    const filter = {
      ...this.buildDateFilter(range),
      status: { $in: [SaleStatus.COMPLETED, SaleStatus.PARTIALLY_RETURNED, SaleStatus.RETURNED] },
    };

    return this.saleModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalSales: { $sum: 1 },
          totalRevenueInCents: { $sum: '$totalInCents' },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', totalSales: 1, totalRevenueInCents: 1, _id: 0 } },
    ]);
  }

  async topProducts(range: DateRange, limit = 10) {
    const filter = {
      ...this.buildDateFilter(range),
      status: { $in: [SaleStatus.COMPLETED, SaleStatus.PARTIALLY_RETURNED, SaleStatus.RETURNED] },
    };

    return this.saleModel.aggregate([
      { $match: filter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          quantitySold: { $sum: '$items.quantity' },
          revenueInCents: { $sum: '$items.subtotalInCents' },
        },
      },
      { $sort: { quantitySold: -1 } },
      { $limit: limit },
      { $project: { productId: '$_id', name: 1, quantitySold: 1, revenueInCents: 1, _id: 0 } },
    ]);
  }

  async paymentMethodBreakdown(range: DateRange) {
    const filter = {
      ...this.buildDateFilter(range),
      status: { $in: [SaleStatus.COMPLETED, SaleStatus.PARTIALLY_RETURNED, SaleStatus.RETURNED] },
    };

    return this.saleModel.aggregate([
      { $match: filter },
      { $unwind: '$payments' },
      {
        $group: {
          _id: '$payments.method',
          totalInCents: { $sum: '$payments.amountInCents' },
          count: { $sum: 1 },
        },
      },
      { $project: { method: '$_id', totalInCents: 1, count: 1, _id: 0 } },
    ]);
  }
}
