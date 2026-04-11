// Storage service for managing app data
import { Doubt, Exam, ExamResult, FlipBook, OMRResult, StudentReport, Video } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  VIDEOS: 'videos',
  FLIPBOOKS: 'flipbooks',
  EXAMS: 'exams',
  DOUBTS: 'doubts',
  EXAM_RESULTS: 'exam_results',
  STUDENT_REPORTS: 'student_reports',
  OMR_RESULTS: 'omr_results',
  WATCH_LATER: 'watch_later',
};

// Video storage
export const saveVideos = async (videos: Video[]): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
};

export const getVideos = async (): Promise<Video[]> => {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.VIDEOS);
  return data ? JSON.parse(data) : [];
};

// Watch Later storage
export const saveWatchLater = async (videoIds: string[]): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.WATCH_LATER, JSON.stringify(videoIds));
};

export const getWatchLater = async (): Promise<string[]> => {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.WATCH_LATER);
  return data ? JSON.parse(data) : [];
};

export const checkWatchLater = async (videoId: string): Promise<boolean> => {
  const watchLater = await getWatchLater();
  return watchLater.includes(videoId);
};

export const toggleWatchLater = async (videoId: string): Promise<boolean> => {
  const watchLater = await getWatchLater();
  const index = watchLater.indexOf(videoId);
  
  if (index >= 0) {
    watchLater.splice(index, 1);
    await saveWatchLater(watchLater);
    return false; // Resulting state is NOT bookmarked
  } else {
    watchLater.push(videoId);
    await saveWatchLater(watchLater);
    return true; // Resulting state is Bookmarked
  }
};

// FlipBook storage
export const saveFlipBooks = async (flipbooks: FlipBook[]): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.FLIPBOOKS, JSON.stringify(flipbooks));
};

export const getFlipBooks = async (): Promise<FlipBook[]> => {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.FLIPBOOKS);
  if (!data) return [];
  const flipbooks = JSON.parse(data);
  // Convert date strings back to Date objects
  return flipbooks.map((flipbook: any) => ({
    ...flipbook,
    uploadDate: flipbook.uploadDate ? new Date(flipbook.uploadDate) : undefined,
  }));
};

// Exam storage
export const saveExams = async (exams: Exam[]): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
};

export const getExams = async (): Promise<Exam[]> => {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.EXAMS);
  if (!data) return [];
  const exams = JSON.parse(data);
  // Convert date strings back to Date objects
  return exams.map((exam: any) => ({
    ...exam,
    startTime: exam.startTime ? new Date(exam.startTime) : undefined,
    endTime: exam.endTime ? new Date(exam.endTime) : undefined,
  }));
};

// Doubt storage
export const saveDoubts = async (doubts: Doubt[]): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.DOUBTS, JSON.stringify(doubts));
};

export const getDoubts = async (): Promise<Doubt[]> => {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.DOUBTS);
  if (!data) return [];
  const doubts = JSON.parse(data);
  // Convert date strings back to Date objects
  return doubts.map((doubt: any) => ({
    ...doubt,
    createdAt: new Date(doubt.createdAt),
    resolvedAt: doubt.resolvedAt ? new Date(doubt.resolvedAt) : undefined,
  }));
};

export const addDoubt = async (doubt: Doubt): Promise<void> => {
  const doubts = await getDoubts();
  doubts.push(doubt);
  await saveDoubts(doubts);
};

// Exam Results storage
export const saveExamResult = async (result: ExamResult): Promise<void> => {
  const results = await getExamResults();
  results.push(result);
  await AsyncStorage.setItem(STORAGE_KEYS.EXAM_RESULTS, JSON.stringify(results));
};

export const getExamResults = async (): Promise<ExamResult[]> => {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.EXAM_RESULTS);
  if (!data) return [];
  const results = JSON.parse(data);
  // Convert date strings back to Date objects
  return results.map((result: any) => ({
    ...result,
    completedAt: new Date(result.completedAt),
  }));
};

// Student Reports storage
export const saveStudentReport = async (report: StudentReport): Promise<void> => {
  const reports = await getStudentReports();
  const index = reports.findIndex(r => r.studentId === report.studentId);
  if (index >= 0) {
    reports[index] = report;
  } else {
    reports.push(report);
  }
  await AsyncStorage.setItem(STORAGE_KEYS.STUDENT_REPORTS, JSON.stringify(reports));
};

export const getStudentReports = async (): Promise<StudentReport[]> => {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.STUDENT_REPORTS);
  return data ? JSON.parse(data) : [];
};

// OMR Results storage
export const saveOMRResult = async (result: OMRResult): Promise<void> => {
  const results = await getOMRResults();
  results.push(result);
  await AsyncStorage.setItem(STORAGE_KEYS.OMR_RESULTS, JSON.stringify(results));
};

export const getOMRResults = async (): Promise<OMRResult[]> => {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.OMR_RESULTS);
  if (!data) return [];
  const results = JSON.parse(data);
  // Convert date strings back to Date objects
  return results.map((result: any) => ({
    ...result,
    scannedAt: new Date(result.scannedAt),
  }));
};

