// ==============================================================================
// Hutty Project Routes
// /api/v1/projects
// ==============================================================================

import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Middleware to optionally decode auth token if present
const optionalAuth = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    return (authenticateToken as any)(req, res, next);
  }
  next();
};

// Customer project listing
router.get('/', authenticateToken as any, ProjectController.getUserProjects as any);

// Project creation (attaches user if authenticated)
router.post('/', optionalAuth, ProjectController.createProject as any);

// Project retrieval (with ownership check)
router.get('/:id', optionalAuth, ProjectController.getProject as any);

// Auto-save update
router.put('/:id', authenticateToken as any, ProjectController.updateProject as any);

// Rename project
router.patch('/:id/rename', authenticateToken as any, ProjectController.renameProject as any);

// Delete/Archive project
router.delete('/:id', authenticateToken as any, ProjectController.deleteProject as any);

export default router;
