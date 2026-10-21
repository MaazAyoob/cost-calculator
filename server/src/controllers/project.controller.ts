// ==============================================================================
// Hutty Project Controller
// Exposes endpoints for durable project creation, auto-save persistence,
// project retrieval, renaming, and archiving with strict ownership checks.
// ==============================================================================

import { Request, Response } from 'express';
import { projectService } from '../services/project.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class ProjectController {
  /**
   * Retrieves all projects owned by the currently authenticated customer.
   * GET /api/v1/projects
   */
  public static async getUserProjects(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const projects = await projectService.getUserProjects(userId);
      res.status(200).json({
        success: true,
        data: projects,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to retrieve customer projects',
      });
    }
  }

  /**
   * Persists a project to PostgreSQL with its configuration and calculation data.
   * POST /api/v1/projects
   */
  public static async createProject(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        id,
        name,
        leadName,
        leadEmail,
        leadPhone,
        city,
        authority,
        configuration,
        calculation,
        snapshot,
      } = req.body;

      // Authoritative User Resolution: prioritize verified server-side session
      const sessionUser = req.user;
      const email = (sessionUser?.email || leadEmail || '').trim().toLowerCase();
      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Homeowner email is required to persist a project',
        });
        return;
      }

      const userId = sessionUser?.id || null;

      let project;
      if (snapshot) {
        project = await projectService.createProjectFromSnapshot({
          leadName: leadName || req.user?.name,
          leadEmail: email,
          leadPhone,
          userId,
          snapshot,
        });
      } else {
        project = await projectService.createProject({
          id,
          name,
          ownerId: userId,
          leadName: leadName || req.user?.name,
          leadEmail: email,
          leadPhone,
          city,
          authority,
          configuration,
          calculation,
        });
      }

      res.status(201).json({
        success: true,
        data: project,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to persist project',
      });
    }
  }

  /**
   * Retrieves a project by ID with ownership verification.
   * GET /api/v1/projects/:id
   */
  public static async getProject(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const project = await projectService.getProjectById(id);
      if (!project) {
        res.status(404).json({
          success: false,
          message: `Project with ID "${id}" not found`,
        });
        return;
      }

      // Customer data isolation & access control
      if (!req.user) {
        if (project.ownerId) {
          res.status(401).json({
            success: false,
            message: 'Authentication required to access this project',
          });
          return;
        }
      } else if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        if (project.ownerId && project.ownerId !== req.user.id) {
          res.status(403).json({
            success: false,
            message: 'Forbidden: You do not have permission to view this project',
          });
          return;
        }
      }

      res.status(200).json({
        success: true,
        data: project,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to retrieve project',
      });
    }
  }

  /**
   * Auto-saves changes to project inputs or calculation snapshots.
   * PUT /api/v1/projects/:id
   */
  public static async updateProject(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const updated = await projectService.updateProject(id, userId, req.body, req.user?.email);
      res.status(200).json({
        success: true,
        message: 'Project updated successfully',
        data: updated,
      });
    } catch (err: any) {
      const isForbidden = err.message?.includes('FORBIDDEN');
      res.status(isForbidden ? 403 : 400).json({
        success: false,
        message: err.message || 'Failed to update project',
      });
    }
  }

  /**
   * Renames a project owned by the caller.
   * PATCH /api/v1/projects/:id/rename
   */
  public static async renameProject(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const updated = await projectService.renameProject(id, userId, name);
      res.status(200).json({
        success: true,
        message: 'Project renamed successfully',
        data: updated,
      });
    } catch (err: any) {
      const isForbidden = err.message?.includes('FORBIDDEN');
      res.status(isForbidden ? 403 : 400).json({
        success: false,
        message: err.message || 'Failed to rename project',
      });
    }
  }

  /**
   * Safely deletes/archives a project owned by the caller.
   * DELETE /api/v1/projects/:id
   */
  public static async deleteProject(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const result = await projectService.deleteProject(id, userId);
      res.status(200).json(result);
    } catch (err: any) {
      const isForbidden = err.message?.includes('FORBIDDEN');
      res.status(isForbidden ? 403 : 400).json({
        success: false,
        message: err.message || 'Failed to delete project',
      });
    }
  }
}
