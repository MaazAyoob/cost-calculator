import express, { Router } from 'express';
import {
  getActiveBrands,
  getActiveProducts,
  getAllBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
} from '../controllers/catalog.controller';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';

// ── Public Router (Mounted at /api/v1/catalog) ──
export const catalogPublicRouter = Router();
catalogPublicRouter.get('/brands', getActiveBrands);
catalogPublicRouter.get('/products', getActiveProducts);

// ── Admin Router (Mounted at /api/v1/admin/catalog) ──
export const catalogAdminRouter = Router();

// Enforce Admin RBAC
catalogAdminRouter.use(authenticateToken as any);
catalogAdminRouter.use(requireAdmin as any);

// Brand Management
catalogAdminRouter.get('/brands', getAllBrands as any);
catalogAdminRouter.post('/brands', createBrand as any);
catalogAdminRouter.put('/brands/:id', updateBrand as any);
catalogAdminRouter.delete('/brands/:id', deleteBrand as any);

// Product / Material Management
catalogAdminRouter.get('/products', getAllProducts as any);
catalogAdminRouter.post('/products', createProduct as any);
catalogAdminRouter.put('/products/:id', updateProduct as any);
catalogAdminRouter.delete('/products/:id', deleteProduct as any);

// Image Upload Endpoint (Dedicated 6MB limit for 5MB max binary upload)
catalogAdminRouter.post('/upload', express.json({ limit: '6mb' }), uploadImage as any);

export default catalogPublicRouter;
