// ==============================================================================
// Hutty Project Controller
// Exposes endpoints for durable project creation, configuration persistence,
// and project retrieval.
// ==============================================================================

import { Request, Response } from 'express';
import { projectService } from '../services/project.service';

export class ProjectController {
  /**
   * Persists a project to PostgreSQL with its configuration and calculation data.
   * POST /api/v1/projects
   */
  public static async createProject(req: Request, res: Response): Promise<void> {
    try {
      const {
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

      const email = leadEmail || (req as any).user?.email;
      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Homeowner email (leadEmail) is required to persist a project',
        });
        return;
      }

      const userId = (req as any).user?.id || null;

      let project;
      if (snapshot) {
        project = await projectService.createProjectFromSnapshot({
          leadName: leadName || (req as any).user?.name,
          leadEmail: email,
          leadPhone,
          userId,
          snapshot,
        });
      } else {
        project = await projectService.createProject({
          name,
          ownerId: userId,
          leadName: leadName || (req as any).user?.name,
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
   * Retrieves a project by ID.
   * GET /api/v1/projects/:id
   */
  public static async getProject(req: Request, res: Response): Promise<void> {
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
}
