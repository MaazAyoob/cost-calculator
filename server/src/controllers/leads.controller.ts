import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { leadsService, LeadStatus } from '../services/leads.service';

/**
 * Controller: Get paginated leads list with summary metrics and date filtering
 * GET /api/v1/admin/leads
 */
export async function getLeads(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const {
      dateFilter,
      startDate,
      endDate,
      search,
      source,
      phoneVerified,
      status,
      sort,
      page,
      limit,
    } = req.query;

    const result = await leadsService.getFilteredLeads({
      dateFilter: typeof dateFilter === 'string' ? dateFilter : undefined,
      startDate: typeof startDate === 'string' ? startDate : undefined,
      endDate: typeof endDate === 'string' ? endDate : undefined,
      search: typeof search === 'string' ? search : undefined,
      source: typeof source === 'string' ? source : undefined,
      phoneVerified: typeof phoneVerified === 'string' ? phoneVerified : undefined,
      status: typeof status === 'string' ? status : undefined,
      sort: sort === 'oldest' ? 'oldest' : 'newest',
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to retrieve leads',
    });
  }
}

/**
 * Controller: Update status or internal admin notes on a lead
 * PATCH /api/v1/admin/leads/:leadKey/status
 */
export async function updateLeadStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { leadKey } = req.params;
    const { status, notes } = req.body;

    if (!leadKey) {
      res.status(400).json({ success: false, error: 'Lead key is required.' });
      return;
    }

    const validStatuses: LeadStatus[] = ['NEW', 'CONTACTED', 'CONVERTED', 'CLOSED'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        error: `Invalid lead status. Must be one of: ${validStatuses.join(', ')}`,
      });
      return;
    }

    const adminEmail = req.user?.email || 'admin@hutty.in';
    const updated = await leadsService.updateLeadStatus(leadKey, status, notes, adminEmail);

    res.status(200).json({
      success: true,
      message: 'Lead status successfully updated.',
      data: updated,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to update lead status',
    });
  }
}

/**
 * Controller: Export leads to CSV or Excel (.xlsx)
 * GET /api/v1/admin/leads/export
 */
export async function exportLeads(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const {
      format = 'csv',
      scope = 'all',
      selectedIds,
      dateFilter,
      startDate,
      endDate,
      search,
      source,
      phoneVerified,
      status,
      sort,
    } = req.query;

    const validFormats = ['csv', 'xlsx'];
    const exportFormat = (typeof format === 'string' && validFormats.includes(format.toLowerCase())
      ? format.toLowerCase()
      : 'csv') as 'csv' | 'xlsx';

    const validScopes = ['all', 'selected', 'verified_only'];
    const exportScope = (typeof scope === 'string' && validScopes.includes(scope.toLowerCase())
      ? scope.toLowerCase()
      : 'all') as 'all' | 'selected' | 'verified_only';

    let parsedSelectedIds: string[] | undefined = undefined;
    if (typeof selectedIds === 'string' && selectedIds.trim()) {
      parsedSelectedIds = selectedIds.split(',').map((id) => id.trim()).filter(Boolean);
    } else if (Array.isArray(selectedIds)) {
      parsedSelectedIds = selectedIds.map(String);
    }

    const exportResult = await leadsService.exportLeads(
      {
        dateFilter: typeof dateFilter === 'string' ? dateFilter : undefined,
        startDate: typeof startDate === 'string' ? startDate : undefined,
        endDate: typeof endDate === 'string' ? endDate : undefined,
        search: typeof search === 'string' ? search : undefined,
        source: typeof source === 'string' ? source : undefined,
        phoneVerified: typeof phoneVerified === 'string' ? phoneVerified : undefined,
        status: typeof status === 'string' ? status : undefined,
        sort: sort === 'oldest' ? 'oldest' : 'newest',
      },
      exportFormat,
      exportScope,
      parsedSelectedIds
    );

    res.setHeader('Content-Type', exportResult.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${exportResult.filename}"`);

    if (exportFormat === 'xlsx') {
      res.setHeader('Content-Length', (exportResult.data as Buffer).length);
      res.status(200).end(exportResult.data);
    } else {
      res.status(200).send(exportResult.data);
    }
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to export leads',
    });
  }
}
