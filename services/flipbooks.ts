// FlipBook service for fetching flipbooks from backend
import { FlipBook } from '@/types';
import { apiService } from './api';

export const flipbookService = {
  // Get all flipbooks
  getAllFlipBooks: async (): Promise<FlipBook[]> => {
    try {
      const response = await apiService.get<FlipBook[]>('/flipbooks', false);
      if (response.success && response.data) {
        return response.data.map((flipbook: any) => ({
          id: flipbook._id || flipbook.id,
          title: flipbook.title,
          pdfUrl: flipbook.pdfUrl,
          thumbnail: flipbook.thumbnail,
          uploadDate: flipbook.createdAt || flipbook.uploadDate,
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching flipbooks:', error);
      return [];
    }
  },

  // Get flipbook by ID
  getFlipBookById: async (id: string): Promise<FlipBook | null> => {
    try {
      const response = await apiService.get<FlipBook>(`/flipbooks/${id}`, false);
      if (response.success && response.data) {
        const flipbook = response.data as any;
        return {
          id: flipbook._id || flipbook.id,
          title: flipbook.title,
          pdfUrl: flipbook.pdfUrl,
          thumbnail: flipbook.thumbnail,
          uploadDate: flipbook.createdAt || flipbook.uploadDate,
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching flipbook:', error);
      return null;
    }
  },
};

