// Exam Results service for fetching and creating exam results from backend
import { ExamResult } from '@/types';
import { apiService } from './api';

export const examResultService = {
  // Get all exam results (for current user)
  getAllResults: async (): Promise<ExamResult[]> => {
    try {
      const response = await apiService.get<ExamResult[]>('/exam-results', true);
      if (response.success && response.data) {
        return response.data.map((result: any) => ({
          examId: result.examId,
          examTitle: result.examTitle,
          score: result.score,
          totalMarks: result.totalMarks,
          percentage: result.percentage,
          answers: result.answers,
          completedAt: new Date(result.completedAt),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching exam results:', error);
      return [];
    }
  },

  // Get exam result by ID
  getResultById: async (id: string): Promise<ExamResult | null> => {
    try {
      const response = await apiService.get<ExamResult>(`/exam-results/${id}`, true);
      if (response.success && response.data) {
        const result = response.data as any;
        return {
          examId: result.examId,
          examTitle: result.examTitle,
          score: result.score,
          totalMarks: result.totalMarks,
          percentage: result.percentage,
          answers: result.answers,
          completedAt: new Date(result.completedAt),
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching exam result:', error);
      return null;
    }
  },

  // Create exam result
  createResult: async (resultData: {
    examId: string;
    examTitle: string;
    score: number;
    totalMarks: number;
    answers: { questionId: string; selectedAnswer: number }[];
  }): Promise<ExamResult | null> => {
    try {
      const response = await apiService.post<ExamResult>('/exam-results', resultData, true);
      if (response.success && response.data) {
        const result = response.data as any;
        return {
          examId: result.examId,
          examTitle: result.examTitle,
          score: result.score,
          totalMarks: result.totalMarks,
          percentage: result.percentage,
          answers: result.answers,
          completedAt: new Date(result.completedAt),
        };
      }
      return null;
    } catch (error) {
      console.error('Error creating exam result:', error);
      throw error;
    }
  },
};

