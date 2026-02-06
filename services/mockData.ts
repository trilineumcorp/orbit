// Mock data for testing the IIT Academy App
import { Doubt, Exam, ExamResult, FlipBook, OMRResult, Video } from '@/types';

export const mockVideos: Video[] = [
  {
    id: '1',
    title: 'Introduction to Physics - Mechanics',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'Learn the fundamentals of mechanics in physics',
    category: 'Physics',
    duration: '45:30',
  },
  {
    id: '2',
    title: 'Chemistry Basics - Organic Compounds',
    youtubeUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
    description: 'Understanding organic chemistry fundamentals',
    category: 'Chemistry',
    duration: '38:15',
  },
  {
    id: '3',
    title: 'Mathematics - Calculus Integration',
    youtubeUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
    description: 'Master integration techniques for IIT JEE',
    category: 'Mathematics',
    duration: '52:20',
  },
  {
    id: '4',
    title: 'Biology - Cell Structure and Function',
    youtubeUrl: 'https://www.youtube.com/watch?v=oHg5SJYRHA0',
    description: 'Detailed explanation of cell biology',
    category: 'Biology',
    duration: '41:10',
  },
];

export const mockFlipBooks: FlipBook[] = [
  {
    id: '1',
    title: 'Physics Formula Handbook',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    thumbnail: '',
    uploadDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'Chemistry Reaction Guide',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    thumbnail: '',
    uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    title: 'Mathematics Problem Sets',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    thumbnail: '',
    uploadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockExams: Exam[] = [
  {
    id: '1',
    title: 'Physics Mock Test - Set 1',
    duration: 60,
    questions: [
      {
        id: 'q1',
        question: 'What is the SI unit of force?',
        options: ['Newton', 'Joule', 'Watt', 'Pascal'],
        correctAnswer: 0,
        marks: 1,
      },
      {
        id: 'q2',
        question: 'Which law states that every action has an equal and opposite reaction?',
        options: ['Newton\'s First Law', 'Newton\'s Second Law', 'Newton\'s Third Law', 'Law of Gravitation'],
        correctAnswer: 2,
        marks: 1,
      },
      {
        id: 'q3',
        question: 'What is the acceleration due to gravity on Earth?',
        options: ['9.8 m/s²', '10 m/s²', '8.9 m/s²', '11 m/s²'],
        correctAnswer: 0,
        marks: 1,
      },
      {
        id: 'q4',
        question: 'Which of the following is a vector quantity?',
        options: ['Mass', 'Speed', 'Velocity', 'Temperature'],
        correctAnswer: 2,
        marks: 2,
      },
      {
        id: 'q5',
        question: 'What is the formula for kinetic energy?',
        options: ['mv', 'mgh', '½mv²', 'Fd'],
        correctAnswer: 2,
        marks: 2,
      },
    ],
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    title: 'Chemistry Practice Test',
    duration: 45,
    questions: [
      {
        id: 'q1',
        question: 'What is the atomic number of Carbon?',
        options: ['6', '12', '14', '16'],
        correctAnswer: 0,
        marks: 1,
      },
      {
        id: 'q2',
        question: 'Which gas is produced during photosynthesis?',
        options: ['Carbon Dioxide', 'Oxygen', 'Nitrogen', 'Hydrogen'],
        correctAnswer: 1,
        marks: 1,
      },
      {
        id: 'q3',
        question: 'What is the pH of pure water?',
        options: ['5', '6', '7', '8'],
        correctAnswer: 2,
        marks: 1,
      },
    ],
    startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    title: 'Mathematics Quick Test',
    duration: 30,
    questions: [
      {
        id: 'q1',
        question: 'What is the derivative of x²?',
        options: ['x', '2x', 'x²', '2x²'],
        correctAnswer: 1,
        marks: 1,
      },
      {
        id: 'q2',
        question: 'What is the value of sin(90°)?',
        options: ['0', '0.5', '1', '√2/2'],
        correctAnswer: 2,
        marks: 1,
      },
      {
        id: 'q3',
        question: 'What is the integral of 2x?',
        options: ['x²', 'x² + C', '2x²', 'x'],
        correctAnswer: 1,
        marks: 2,
      },
    ],
  },
];

export const mockDoubts: Doubt[] = [
  {
    id: '1',
    title: 'Question about Newton\'s Laws',
    description: 'I am confused about the difference between Newton\'s first and second law. Can someone explain with examples?',
    subject: 'Physics',
    status: 'resolved',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    resolvedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    response: 'Newton\'s First Law states that an object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force. Newton\'s Second Law relates force, mass, and acceleration: F = ma.',
  },
  {
    id: '2',
    title: 'Organic Chemistry Nomenclature',
    description: 'How do I name complex organic compounds? I find the IUPAC naming system confusing.',
    subject: 'Chemistry',
    status: 'in-progress',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    title: 'Integration by Parts',
    description: 'Can someone explain the integration by parts formula? When should I use it?',
    subject: 'Mathematics',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: '4',
    title: 'Cell Division Process',
    description: 'I need clarification on the difference between mitosis and meiosis.',
    subject: 'Biology',
    status: 'resolved',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    resolvedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    response: 'Mitosis produces two identical diploid cells, while meiosis produces four genetically different haploid cells. Mitosis is for growth and repair, meiosis is for sexual reproduction.',
  },
];

export const mockExamResults: ExamResult[] = [
  {
    examId: '1',
    examTitle: 'Physics Mock Test - Set 1',
    score: 7,
    totalMarks: 8,
    percentage: 87.5,
    answers: [
      { questionId: 'q1', selectedAnswer: 0 },
      { questionId: 'q2', selectedAnswer: 2 },
      { questionId: 'q3', selectedAnswer: 0 },
      { questionId: 'q4', selectedAnswer: 2 },
      { questionId: 'q5', selectedAnswer: 2 },
    ],
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    examId: '2',
    examTitle: 'Chemistry Practice Test',
    score: 2,
    totalMarks: 3,
    percentage: 66.7,
    answers: [
      { questionId: 'q1', selectedAnswer: 0 },
      { questionId: 'q2', selectedAnswer: 1 },
      { questionId: 'q3', selectedAnswer: 0 },
    ],
    completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
];

export const mockOMRResults: OMRResult[] = [
  {
    id: '1',
    studentName: 'John Doe',
    rollNumber: 'STU001',
    examName: 'Physics Midterm',
    score: 42,
    totalQuestions: 50,
    scannedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    answers: Array.from({ length: 50 }, (_, i) => ({
      questionNumber: i + 1,
      selectedOption: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)] as 'A' | 'B' | 'C' | 'D',
      isCorrect: Math.random() > 0.15,
    })),
  },
  {
    id: '2',
    studentName: 'Jane Smith',
    rollNumber: 'STU002',
    examName: 'Chemistry Final',
    score: 38,
    totalQuestions: 50,
    scannedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    answers: Array.from({ length: 50 }, (_, i) => ({
      questionNumber: i + 1,
      selectedOption: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)] as 'A' | 'B' | 'C' | 'D',
      isCorrect: Math.random() > 0.2,
    })),
  },
];

// Initialize mock data function
export const initializeMockData = async () => {
  const { saveVideos, saveFlipBooks, saveExams, saveDoubts, saveOMRResult } = await import('./storage');
  const { getVideos, getFlipBooks, getExams, getDoubts, getOMRResults } = await import('./storage');

  // Only initialize if storage is empty
  const existingVideos = await getVideos();
  if (existingVideos.length === 0) {
    await saveVideos(mockVideos);
  }

  const existingFlipBooks = await getFlipBooks();
  if (existingFlipBooks.length === 0) {
    await saveFlipBooks(mockFlipBooks);
  }

  const existingExams = await getExams();
  if (existingExams.length === 0) {
    await saveExams(mockExams);
  }

  const existingDoubts = await getDoubts();
  if (existingDoubts.length === 0) {
    await saveDoubts(mockDoubts);
  }

  const existingOMRResults = await getOMRResults();
  if (existingOMRResults.length === 0) {
    for (const result of mockOMRResults) {
      await saveOMRResult(result);
    }
  }

  const { getExamResults, saveExamResult } = await import('./storage');
  const existingExamResults = await getExamResults();
  if (existingExamResults.length === 0) {
    for (const result of mockExamResults) {
      await saveExamResult(result);
    }
  }
};

