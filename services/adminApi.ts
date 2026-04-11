import { apiService } from './api';

export async function getAdminDashboardStats() {
  const res = await apiService.get<{
    users: { total: number; active: number };
    content: { discussions: number };
    moderation: { totalReports: number; pendingReports: number };
    operations: { totalBulkOperations: number };
  }>('/admin/dashboard/stats', true);
  return res.success && res.data ? res.data : null;
}

export async function getPlatformAnalytics(startDate?: string, endDate?: string) {
  let q = '/analytics/platform';
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  const s = params.toString();
  if (s) q += `?${s}`;
  const res = await apiService.get<unknown>(q, true);
  return res.success ? res.data : null;
}

export async function getTopContent(limit = 10) {
  const res = await apiService.get<unknown>(`/analytics/platform/top-content?limit=${limit}`, true);
  return res.success ? res.data : null;
}

export async function getSubjectAnalytics() {
  const res = await apiService.get<unknown>('/analytics/platform/subjects', true);
  return res.success ? res.data : null;
}

export async function getModerationActions(page = 1, limit = 20) {
  const res = await apiService.get<unknown>(
    `/admin/moderation?page=${page}&limit=${limit}`,
    true
  );
  return res.success ? res.data : null;
}

export async function getUserReportsAdmin(page = 1, limit = 20, status?: string) {
  let path = `/admin/reports?page=${page}&limit=${limit}`;
  if (status) path += `&status=${encodeURIComponent(status)}`;
  const res = await apiService.get<unknown>(path, true);
  return res.success ? res.data : null;
}

export async function getBulkOperations(page = 1, limit = 20) {
  const res = await apiService.get<unknown>(
    `/admin/bulk-operations?page=${page}&limit=${limit}`,
    true
  );
  return res.success ? res.data : null;
}

export async function createBulkOperation(body: {
  operationType: string;
  totalItems: number;
  parameters?: Record<string, unknown>;
  fileUrl?: string;
}) {
  return apiService.post('/admin/bulk-operations', body, true);
}

export async function getSystemSettings(category?: string, includePrivate = true) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (includePrivate) params.set('includePrivate', 'true');
  const q = params.toString();
  const path = `/admin/settings${q ? `?${q}` : ''}`;
  const res = await apiService.get<unknown>(path, true);
  return res.success ? res.data : null;
}

export async function updateSystemSetting(body: {
  key: string;
  value: unknown;
  description?: string;
  category: string;
  isPublic?: boolean;
}) {
  return apiService.post('/admin/settings', body, true);
}
