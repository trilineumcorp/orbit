// Content service for managing videos, flipbooks, and exams
import { apiService } from './api';

export interface Video {
  _id?: string;
  id?: string;
  title: string;
  youtubeUrl: string;
  description?: string;
  category?: string;
  duration?: number;
  thumbnail?: string;
  standard?: number; // 6, 7, 8, 9, 10
  subject?: string; // Mathematics, Physics, Chemistry, Biology
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FlipBook {
  _id?: string;
  id?: string;
  title: string;
  pdfUrl: string;
  thumbnail?: string;
  description?: string;
  standard?: number; // 6, 7, 8, 9, 10
  subject?: string; // Mathematics, Physics, Chemistry, Biology
  uploadDate?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Exam {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  duration: number; // in minutes
  questions: ExamQuestion[];
  totalMarks?: number;
  passingMarks?: number;
  standard?: number; // 6, 7, 8, 9, 10
  subject?: string; // Mathematics, Physics, Chemistry, Biology
  examType?: string; // IIT, NEET
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExamQuestion {
  id?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  marks: number;
}

// Video API
export interface PaginatedVideos {
  videos: Video[];
  nextPage?: number;
  totalPages: number;
}

export const getInfiniteVideos = async (standard?: number, subject?: string, page: number = 1, limit: number = 10): Promise<PaginatedVideos> => {
  try {
    let url = '/videos';
    const params: string[] = [`page=${page}`, `limit=${limit}`];
    if (standard) params.push(`standard=${standard}`);
    if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
    url += `?${params.join('&')}`;
    
    const response = await apiService.get<any>(url, false);
    if (response.success && response.data) {
      const videos = response.data.map((v: any) => ({ ...v, id: v._id || v.id }));
      const pagination = response.pagination;
      return {
        videos,
        nextPage: pagination?.page && pagination?.pages && pagination.page < pagination.pages 
          ? pagination.page + 1 
          : undefined,
        totalPages: pagination?.pages || 1,
      };
    }
    return { videos: [], totalPages: 0 };
  } catch (error) {
    console.error('Error fetching infinite videos:', error);
    throw error;
  }
};
export const getVideos = async (standard?: number, subject?: string): Promise<Video[]> => {
  try {
    let url = '/videos';
    const params: string[] = [];
    if (standard) params.push(`standard=${standard}`);
    if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    
    console.log('Fetching videos from:', url, { standard, subject });
    const response = await apiService.get<Video[]>(url, false);
    console.log('Videos response:', { success: response.success, dataLength: response.data?.length || 0 });
    
    if (response.success && response.data) {
      // Map MongoDB _id to id for frontend compatibility
      return response.data.map((video: any) => ({
        ...video,
        id: video._id || video.id,
      }));
    }
    return [];
  } catch (error: any) {
    console.error('Error fetching videos:', error);
    throw error;
  }
};

export const getVideoById = async (id: string): Promise<Video | null> => {
  const response = await apiService.get<Video>(`/videos/${id}`, false);
  if (response.success && response.data) {
    return response.data;
  }
  return null;
};

export const createVideo = async (videoData: Omit<Video, '_id' | 'id' | 'createdAt' | 'updatedAt'>): Promise<Video> => {
  const response = await apiService.post<Video>('/videos', videoData, true);
  if (response.success && response.data) {
    return response.data;
  }
  throw new Error(response.message || 'Failed to create video');
};

export const updateVideo = async (id: string, videoData: Partial<Video>): Promise<Video> => {
  const response = await apiService.put<Video>(`/videos/${id}`, videoData, true);
  if (response.success && response.data) {
    return response.data;
  }
  throw new Error(response.message || 'Failed to update video');
};

export const deleteVideo = async (id: string): Promise<void> => {
  const response = await apiService.delete(`/videos/${id}`, true);
  if (!response.success) {
    throw new Error(response.message || 'Failed to delete video');
  }
};

// FlipBook API
export const getFlipBooks = async (standard?: number, subject?: string): Promise<FlipBook[]> => {
  try {
    let url = '/flipbooks';
    const params: string[] = [];
    if (standard) params.push(`standard=${standard}`);
    if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    
    console.log('Fetching flipbooks from:', url, { standard, subject });
    const response = await apiService.get<FlipBook[]>(url, false);
    console.log('Flipbooks response:', { success: response.success, dataLength: response.data?.length || 0 });
    
    if (response.success && response.data) {
      // Map MongoDB _id to id for frontend compatibility
      return response.data.map((flipbook: any) => ({
        ...flipbook,
        id: flipbook._id || flipbook.id,
      }));
    }
    return [];
  } catch (error: any) {
    console.error('Error fetching flipbooks:', error);
    throw error;
  }
};

export const getFlipBookById = async (id: string): Promise<FlipBook | null> => {
  const response = await apiService.get<FlipBook>(`/flipbooks/${id}`, false);
  if (response.success && response.data) {
    return response.data;
  }
  return null;
};

export const createFlipBook = async (flipbookData: Omit<FlipBook, '_id' | 'id' | 'createdAt' | 'updatedAt'>): Promise<FlipBook> => {
  const response = await apiService.post<FlipBook>('/flipbooks', flipbookData, true);
  if (response.success && response.data) {
    return response.data;
  }
  throw new Error(response.message || 'Failed to create flipbook');
};

export const updateFlipBook = async (id: string, flipbookData: Partial<FlipBook>): Promise<FlipBook> => {
  const response = await apiService.put<FlipBook>(`/flipbooks/${id}`, flipbookData, true);
  if (response.success && response.data) {
    return response.data;
  }
  throw new Error(response.message || 'Failed to update flipbook');
};

export const deleteFlipBook = async (id: string): Promise<void> => {
  const response = await apiService.delete(`/flipbooks/${id}`, true);
  if (!response.success) {
    throw new Error(response.message || 'Failed to delete flipbook');
  }
};

// Exam API
export const getExams = async (standard?: number, subject?: string, examType?: string): Promise<Exam[]> => {
  try {
    let url = '/exams';
    const params: string[] = [];
    if (standard) params.push(`standard=${standard}`);
    if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
    if (examType) params.push(`examType=${encodeURIComponent(examType)}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    
    console.log('Fetching exams from:', url, { standard, subject, examType });
    const response = await apiService.get<Exam[]>(url, false);
    console.log('Exams response:', { success: response.success, dataLength: response.data?.length || 0 });
    
    if (response.success && response.data) {
      // Map MongoDB _id to id for frontend compatibility
      return response.data.map((exam: any) => ({
        ...exam,
        id: exam._id || exam.id,
      }));
    }
    return [];
  } catch (error: any) {
    console.error('Error fetching exams:', error);
    throw error;
  }
};

export const getExamById = async (id: string): Promise<Exam | null> => {
  const response = await apiService.get<Exam>(`/exams/${id}`, false);
  if (response.success && response.data) {
    return response.data;
  }
  return null;
};

export const createExam = async (examData: Omit<Exam, '_id' | 'id' | 'createdAt' | 'updatedAt'>): Promise<Exam> => {
  const response = await apiService.post<Exam>('/exams', examData, true);
  if (response.success && response.data) {
    return response.data;
  }
  throw new Error(response.message || 'Failed to create exam');
};

export const updateExam = async (id: string, examData: Partial<Exam>): Promise<Exam> => {
  const response = await apiService.put<Exam>(`/exams/${id}`, examData, true);
  if (response.success && response.data) {
    return response.data;
  }
  throw new Error(response.message || 'Failed to update exam');
};

export const deleteExam = async (id: string): Promise<void> => {
  const response = await apiService.delete(`/exams/${id}`, true);
  if (!response.success) {
    throw new Error(response.message || 'Failed to delete exam');
  }
};

