import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserRole } from '../../users/enums/user-role.enum';
import { CatalogService } from '../services/catalog.service';

@ApiTags('Catalog')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('products')
  searchProducts(
    @Query('q') q?: string,
    @Query('categoryId') categoryId?: string,
    @Query('rentable') rentable?: string,
  ) {
    return this.catalogService.searchProducts(q, categoryId, rentable === 'true');
  }

  @Get('products/low-stock')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE)
  lowStock() {
    return this.catalogService.lowStock();
  }

  @Get('products/barcode/:barcode')
  getByBarcode(@Param('barcode') barcode: string) {
    return this.catalogService.getProductByBarcode(barcode);
  }

  @Get('products/:id')
  getProduct(@Param('id') id: string) {
    return this.catalogService.getProduct(id);
  }

  @Post('products')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE)
  createProduct(@Body() payload: Record<string, unknown>) {
    return this.catalogService.createProduct(payload);
  }

  @Patch('products/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE)
  updateProduct(
    @Param('id') id: string,
    @Body() payload: Record<string, unknown>,
  ) {
    return this.catalogService.updateProduct(id, payload);
  }

  @Get('categories')
  listCategories() {
    return this.catalogService.listCategories();
  }

  @Post('categories')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE)
  createCategory(@Body() payload: Record<string, unknown>) {
    return this.catalogService.createCategory(payload);
  }

  @Get('brands')
  listBrands() {
    return this.catalogService.listBrands();
  }

  @Post('brands')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE)
  createBrand(@Body() payload: Record<string, unknown>) {
    return this.catalogService.createBrand(payload);
  }

  @Get('suppliers')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE)
  listSuppliers() {
    return this.catalogService.listSuppliers();
  }

  @Post('suppliers')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE)
  createSupplier(@Body() payload: Record<string, unknown>) {
    return this.catalogService.createSupplier(payload);
  }
}
