// ==============================================================================
// Hutty Admin User Management Controller
// ==============================================================================

import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { userManagementService } from '../services/userManagement.service';

/**
 * GET /api/v1/admin/users
 * Lists customer users with search, status filtering, pagination, and activity counts.
 */
export async function getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { search, status, sort, page, limit } = req.query;

    const result = await userManagementService.getUsers({
      search: typeof search === 'string' ? search : undefined,
      status: (status === 'ACTIVE' || status === 'DISABLED') ? status : 'ALL',
      sort: (sort === 'oldest' || sort === 'name') ? sort : 'newest',
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 25,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to retrieve users',
    });
  }
}

/**
 * PATCH /api/v1/admin/users/:id/disable
 * Disables a customer account, blocking future logins and invalidating sessions.
 */
export async function disableUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminEmail = req.user?.email || 'admin@hutty.in';

    if (!id) {
      res.status(400).json({ success: false, error: 'User ID is required' });
      return;
    }

    const updated = await userManagementService.disableUser(id, reason, adminEmail);

    res.json({
      success: true,
      message: `Account for ${updated.name} (${updated.email}) has been disabled.`,
      data: updated,
    });
  } catch (err: any) {
    const status = err.message?.includes('SECURITY_VIOLATION') || err.message?.includes('prohibited') ? 403 : 400;
    res.status(status).json({
      success: false,
      error: err.message || 'Failed to disable user',
    });
  }
}

/**
 * PATCH /api/v1/admin/users/:id/restore
 * Restores a disabled account to active status.
 */
export async function restoreUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const adminEmail = req.user?.email || 'admin@hutty.in';

    if (!id) {
      res.status(400).json({ success: false, error: 'User ID is required' });
      return;
    }

    const updated = await userManagementService.restoreUser(id, adminEmail);

    res.json({
      success: true,
      message: `Account for ${updated.name} (${updated.email}) has been restored to active status.`,
      data: updated,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to restore user',
    });
  }
}

/**
 * DELETE /api/v1/admin/users/:id
 * Permanently removes or safely anonymizes a customer account.
 */
export async function deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { confirm, reason } = req.body;
    const adminEmail = req.user?.email || 'admin@hutty.in';

    if (!id) {
      res.status(400).json({ success: false, error: 'User ID is required' });
      return;
    }

    if (!confirm) {
      res.status(400).json({
        success: false,
        error: 'Explicit confirmation { confirm: true } is required to delete an account.',
      });
      return;
    }

    const result = await userManagementService.deleteUser(id, confirm, reason, adminEmail);

    res.json(result);
  } catch (err: any) {
    const status = err.message?.includes('SECURITY_VIOLATION') || err.message?.includes('prohibited') ? 403 : 400;
    res.status(status).json({
      success: false,
      error: err.message || 'Failed to delete user',
    });
  }
}
