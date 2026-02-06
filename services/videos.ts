// Video service for fetching videos from backend
import { Video } from '@/types';
import { apiService } from './api';

export const videoService = {
  // Get all videos
  getAllVideos: async (): Promise<Video[]> => {
    try {
      const response = await apiService.get<Video[]>('/videos', false);
      if (response.success && response.data) {
        return response.data.map((video: any) => ({
          id: video._id || video.id,
          title: video.title,
          youtubeUrl: video.youtubeUrl,
          description: video.description,
          category: video.category,
          duration: video.duration,
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching videos:', error);
      return [];
    }
  },

  // Get video by ID
  getVideoById: async (id: string): Promise<Video | null> => {
    try {
      const response = await apiService.get<Video>(`/videos/${id}`, false);
      if (response.success && response.data) {
        const video = response.data as any;
        return {
          id: video._id || video.id,
          title: video.title,
          youtubeUrl: video.youtubeUrl,
          description: video.description,
          category: video.category,
          duration: video.duration,
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching video:', error);
      return null;
    }
  },
};

