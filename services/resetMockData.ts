// Utility to reset mock data (useful for testing)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeMockData } from './mockData';

const STORAGE_KEYS = {
  VIDEOS: 'videos',
  FLIPBOOKS: 'flipbooks',
  EXAMS: 'exams',
  DOUBTS: 'doubts',
  EXAM_RESULTS: 'exam_results',
  STUDENT_REPORTS: 'student_reports',
  OMR_RESULTS: 'omr_results',
};

export const resetAllMockData = async (): Promise<void> => {
  // Clear all storage
  await Promise.all([
    AsyncStorage.removeItem(STORAGE_KEYS.VIDEOS),
    AsyncStorage.removeItem(STORAGE_KEYS.FLIPBOOKS),
    AsyncStorage.removeItem(STORAGE_KEYS.EXAMS),
    AsyncStorage.removeItem(STORAGE_KEYS.DOUBTS),
    AsyncStorage.removeItem(STORAGE_KEYS.EXAM_RESULTS),
    AsyncStorage.removeItem(STORAGE_KEYS.STUDENT_REPORTS),
    AsyncStorage.removeItem(STORAGE_KEYS.OMR_RESULTS),
  ]);

  // Reinitialize with mock data
  await initializeMockData();
};

