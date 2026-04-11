import { apiService } from './api';

export async function trackActivity(payload: {
  type: string;
  contentId?: string;
  subject?: string;
  duration?: number;
  score?: number;
}): Promise<void> {
  try {
    await apiService.post('/analytics/activity', payload, true);
  } catch (e) {
    console.warn('[analytics] trackActivity', e);
  }
}

export async function getUserAnalytics(): Promise<unknown | null> {
  try {
    const res = await apiService.get<unknown>('/analytics/user', true);
    return res.success && res.data !== undefined ? res.data : null;
  } catch {
    return null;
  }
}
