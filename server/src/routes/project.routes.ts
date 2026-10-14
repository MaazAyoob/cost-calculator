// ==============================================================================
// Hutty Project Routes
// /api/v1/projects
// ==============================================================================

import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';

const router = Router();

router.post('/', ProjectController.createProject);
router.get('/:id', ProjectController.getProject);

export default router;
