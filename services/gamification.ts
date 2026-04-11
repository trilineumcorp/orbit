import { apiService } from './api';

export async function getLeaderboard(type = 'all-time', limit = 50) {
  const res = await apiService.get<unknown>(
    `/gamification/leaderboard?type=${encodeURIComponent(type)}&limit=${limit}`,
    true
  );
  return res.success ? res.data : null;
}

export async function getGamificationProfile(userId: string) {
  const res = await apiService.get<unknown>(`/gamification/profile/${userId}`, true);
  return res.success ? res.data : null;
}

export async function getUserBadges(userId: string) {
  const res = await apiService.get<unknown>(`/gamification/badges/${userId}`, true);
  return res.success ? res.data : null;
}

export async function getUserAchievements(userId: string) {
  const res = await apiService.get<unknown>(`/gamification/achievements/${userId}`, true);
  return res.success ? res.data : null;
}

export async function adminAwardPoints(userId: string, points: number, reason: string) {
  return apiService.post('/gamification/award-points', { userId, points, reason }, true);
}
