import { apiService } from './api';

export async function getStudyGroups(page = 1, limit = 20) {
  const res = await apiService.get<unknown>(
    `/social/study-groups?page=${page}&limit=${limit}`,
    true
  );
  return res.success ? res.data : null;
}

export async function getDiscussions(page = 1, limit = 20) {
  const res = await apiService.get<unknown>(
    `/social/discussions?page=${page}&limit=${limit}`,
    true
  );
  return res.success ? res.data : null;
}

export async function createDiscussion(body: {
  title: string;
  content: string;
  category?: string;
  tags?: string[];
}) {
  return apiService.post('/social/discussions', body, true);
}

export async function joinStudyGroup(groupId: string, joinCode?: string) {
  return apiService.post(`/social/study-groups/${groupId}/join`, { joinCode: joinCode ?? '' }, true);
}
