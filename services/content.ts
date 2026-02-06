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
export const getVideos = async (standard?: number, subject?: string): Promise<Video[]> => {
  let url = '/videos';
  const params: string[] = [];
  if (standard) params.push(`standard=${standard}`);
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (params.length > 0) url += `?${params.join('&')}`;
  
  const response = await apiService.get<Video[]>(url, false);
  if (response.success && response.data) {
    return response.data;
  }
  return [];
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
  let url = '/flipbooks';
  const params: string[] = [];
  if (standard) params.push(`standard=${standard}`);
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (params.length > 0) url += `?${params.join('&')}`;
  
  const response = await apiService.get<FlipBook[]>(url, false);
  if (response.success && response.data) {
    return response.data;
  }
  return [];
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
  let url = '/exams';
  const params: string[] = [];
  if (standard) params.push(`standard=${standard}`);
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (examType) params.push(`examType=${encodeURIComponent(examType)}`);
  if (params.length > 0) url += `?${params.join('&')}`;
  
  const response = await apiService.get<Exam[]>(url, false);
  if (response.success && response.data) {
    return response.data;
  }
  return [];
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

