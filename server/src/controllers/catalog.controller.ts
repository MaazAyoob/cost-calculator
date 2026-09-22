import { Request, Response } from 'express';
import { catalogService } from '../services/catalog.service';
import { storageService } from '../services/storage.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

// ═════════════════════════════════════════════════════════════════════════
// PUBLIC CATALOG CONTROLLERS (Customer Facing)
// ═════════════════════════════════════════════════════════════════════════

export async function getActiveBrands(req: Request, res: Response): Promise<void> {
  try {
    const brands = await catalogService.getActiveBrands();
    res.json({
      success: true,
      count: brands.length,
      data: brands,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve active brand catalog',
      message: err.message,
    });
  }
}

export async function getActiveProducts(req: Request, res: Response): Promise<void> {
  try {
    const { category, brandId } = req.query as { category?: string; brandId?: string };
    const products = await catalogService.getActiveProducts(category, brandId);
    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve active product catalog',
      message: err.message,
    });
  }
}

// ═════════════════════════════════════════════════════════════════════════
// ADMIN CATALOG CONTROLLERS (RBAC Protected)
// ═════════════════════════════════════════════════════════════════════════

export async function getAllBrands(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const brands = await catalogService.getAllBrands();
    res.json({
      success: true,
      count: brands.length,
      data: brands,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve brands',
      message: err.message,
    });
  }
}

export async function createBrand(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const adminEmail = req.user?.email || 'admin@hutty.in';
    const brand = await catalogService.createBrand(req.body, adminEmail);
    res.status(201).json({
      success: true,
      message: `Brand "${brand.name}" created successfully`,
      data: brand,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to create brand',
    });
  }
}

export async function updateBrand(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const adminEmail = req.user?.email || 'admin@hutty.in';
    const updated = await catalogService.updateBrand(id, req.body, adminEmail);
    res.json({
      success: true,
      message: `Brand "${updated.name}" updated successfully`,
      data: updated,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to update brand',
    });
  }
}

export async function deleteBrand(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const adminEmail = req.user?.email || 'admin@hutty.in';
    const deleted = await catalogService.deleteBrand(id, adminEmail);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Brand not found' });
      return;
    }
    res.json({
      success: true,
      message: 'Brand removed or deactivated successfully',
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to delete brand',
    });
  }
}

export async function getAllProducts(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { category, brandId, active } = req.query as { category?: string; brandId?: string; active?: string };
    const filters: any = {};
    if (category) filters.category = category;
    if (brandId) filters.brandId = brandId;
    if (active !== undefined) filters.active = active === 'true' || active === '1';

    const products = await catalogService.getAllProducts(filters);
    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve products',
      message: err.message,
    });
  }
}

export async function createProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const adminEmail = req.user?.email || 'admin@hutty.in';
    const product = await catalogService.createProduct(req.body, adminEmail);
    res.status(201).json({
      success: true,
      message: `Product "${product.name}" created successfully`,
      data: product,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to create product',
    });
  }
}

export async function updateProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const adminEmail = req.user?.email || 'admin@hutty.in';
    const updated = await catalogService.updateProduct(id, req.body, adminEmail);
    res.json({
      success: true,
      message: `Product "${updated.name}" updated successfully`,
      data: updated,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to update product',
    });
  }
}

export async function deleteProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const adminEmail = req.user?.email || 'admin@hutty.in';
    const deleted = await catalogService.deleteProduct(id, adminEmail);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }
    res.json({
      success: true,
      message: 'Product removed or deactivated successfully',
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to delete product',
    });
  }
}

export async function uploadImage(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { image, filename } = req.body;
    if (!image) {
      res.status(400).json({
        success: false,
        error: 'Missing required image payload (base64 or data URI)',
      });
      return;
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const result = await storageService.saveBase64Image(image, filename, baseUrl);

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message || 'Image upload failed',
    });
  }
}
