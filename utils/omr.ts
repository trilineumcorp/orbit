// OMR Scanner utility functions

export interface OMRAnswer {
  questionNumber: number;
  selectedOption: 'A' | 'B' | 'C' | 'D' | 'E' | null;
  confidence: number; // 0-1
}

export interface OMRBubble {
  x: number;
  y: number;
  width: number;
  height: number;
  option: 'A' | 'B' | 'C' | 'D' | 'E';
  questionNumber: number;
  isFilled: boolean;
  fillPercentage: number;
}

/**
 * Process image to detect OMR bubbles
 * This is a simplified version - in production, you'd use ML models
 */
export const detectOMRBubbles = async (
  imageUri: string,
  totalQuestions: number = 50,
  optionsPerQuestion: number = 4
): Promise<OMRBubble[]> => {
  // This is a placeholder - in a real implementation, you would:
  // 1. Load and preprocess the image
  // 2. Detect bubble regions using image processing or ML
  // 3. Analyze fill percentage for each bubble
  // 4. Return detected bubbles

  // For now, return mock data structure
  const bubbles: OMRBubble[] = [];
  
  // Mock implementation - replace with actual image processing
  for (let q = 1; q <= totalQuestions; q++) {
    for (let opt = 0; opt < optionsPerQuestion; opt++) {
      const option = String.fromCharCode(65 + opt) as 'A' | 'B' | 'C' | 'D' | 'E';
      bubbles.push({
        x: 50 + opt * 100,
        y: 100 + q * 30,
        width: 20,
        height: 20,
        option,
        questionNumber: q,
        isFilled: false, // Would be determined by image analysis
        fillPercentage: 0, // Would be calculated from image
      });
    }
  }

  return bubbles;
};

/**
 * Analyze bubbles to determine selected answers
 */
export const analyzeOMRAnswers = (bubbles: OMRBubble[]): OMRAnswer[] => {
  const answers: OMRAnswer[] = [];
  const questionGroups = new Map<number, OMRBubble[]>();

  // Group bubbles by question
  bubbles.forEach(bubble => {
    if (!questionGroups.has(bubble.questionNumber)) {
      questionGroups.set(bubble.questionNumber, []);
    }
    questionGroups.get(bubble.questionNumber)!.push(bubble);
  });

  // Determine selected answer for each question
  questionGroups.forEach((bubbles, questionNumber) => {
    // Find bubble with highest fill percentage
    const filledBubble = bubbles
      .filter(b => b.fillPercentage > 0.5)
      .sort((a, b) => b.fillPercentage - a.fillPercentage)[0];

    answers.push({
      questionNumber,
      selectedOption: filledBubble ? filledBubble.option : null,
      confidence: filledBubble ? filledBubble.fillPercentage : 0,
    });
  });

  return answers;
};

/**
 * Calculate score from OMR answers
 */
export const calculateOMRScore = (
  answers: OMRAnswer[],
  correctAnswers: Map<number, 'A' | 'B' | 'C' | 'D' | 'E'>,
  marksPerQuestion: number = 1
): { score: number; totalMarks: number; details: { questionNumber: number; isCorrect: boolean }[] } => {
  let score = 0;
  const details: { questionNumber: number; isCorrect: boolean }[] = [];

  answers.forEach(answer => {
    const isCorrect = answer.selectedOption === correctAnswers.get(answer.questionNumber);
    if (isCorrect) {
      score += marksPerQuestion;
    }
    details.push({
      questionNumber: answer.questionNumber,
      isCorrect: isCorrect || false,
    });
  });

  return {
    score,
    totalMarks: answers.length * marksPerQuestion,
    details,
  };
};

