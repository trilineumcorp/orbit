// Type definitions for the IIT Academy App

export interface Video {
  id: string;
  title: string;
  youtubeUrl: string;
  description?: string;
  category?: string;
  duration?: string;
}

export interface FlipBook {
  id: string;
  title: string;
  pdfUrl: string;
  thumbnail?: string;
  uploadDate?: string;
}

export interface Exam {
  id: string;
  title: string;
  duration: number; // in minutes
  questions: Question[];
  startTime?: Date;
  endTime?: Date;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  marks: number;
}

export interface ExamResult {
  examId: string;
  examTitle: string;
  score: number;
  totalMarks: number;
  percentage: number;
  answers: { questionId: string; selectedAnswer: number }[];
  completedAt: Date;
}

export interface Doubt {
  id: string;
  title: string;
  description: string;
  subject?: string;
  status: 'pending' | 'resolved' | 'in-progress';
  createdAt: Date;
  resolvedAt?: Date;
  response?: string;
}

export interface StudentReport {
  studentId: string;
  studentName: string;
  overallScore: number;
  examResults: ExamResult[];
  attendance?: number;
  performance: {
    subject: string;
    score: number;
    rank?: number;
  }[];
}

export interface OMRResult {
  id: string;
  studentName: string;
  rollNumber: string;
  examName: string;
  score: number;
  totalQuestions: number;
  scannedAt: Date;
  answers: { questionNumber: number; selectedOption: string; isCorrect: boolean }[];
}

export type UserRole = 'admin' | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  avatarUrl?: string | null;
  // Student specific fields
  rollNumber?: string;
  class?: string;
  // Admin specific fields
  permissions?: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
}

