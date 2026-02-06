import { PremiumHeader } from '@/components/premium-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getExams, saveExamResult } from '@/services/storage';
import { Exam, ExamResult } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ExamTakeScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [exam, setExam] = useState<Exam | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, number>>(new Map());
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    loadExam();
  }, []);

  useEffect(() => {
    if (started && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            submitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [started, timeRemaining]);

  const loadExam = async () => {
    const exams = await getExams();
    const found = exams.find(e => e.id === params.examId);
    if (found) {
      setExam(found);
      setTimeRemaining(found.duration * 60);
    }
  };

  const startExam = () => {
    Alert.alert('Start Exam', 'Are you ready to begin?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Start',
        onPress: () => {
          setStarted(true);
          setTimeRemaining(exam!.duration * 60);
        },
      },
    ]);
  };

  const selectAnswer = (questionId: string, optionIndex: number) => {
    const newAnswers = new Map(answers);
    newAnswers.set(questionId, optionIndex);
    setAnswers(newAnswers);
  };

  const submitExam = async () => {
    if (!exam) return;

    const score = exam.questions.reduce((total, question) => {
      const selectedAnswer = answers.get(question.id);
      if (selectedAnswer === question.correctAnswer) {
        return total + question.marks;
      }
      return total;
    }, 0);

    const totalMarks = exam.questions.reduce((total, question) => total + question.marks, 0);

    const result: ExamResult = {
      examId: exam.id,
      examTitle: exam.title,
      score,
      totalMarks,
      percentage: (score / totalMarks) * 100,
      answers: Array.from(answers.entries()).map(([questionId, selectedAnswer]) => ({
        questionId,
        selectedAnswer,
      })),
      completedAt: new Date(),
    };

    await saveExamResult(result);
    Alert.alert('Exam Submitted', `Your score: ${score}/${totalMarks} (${result.percentage.toFixed(1)}%)`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  if (!exam) {
    return (
      <ThemedView style={styles.container}>
        <PremiumHeader
          title="Exam"
          showBackButton={true}
        />
        <View style={styles.errorContainer}>
          <IconSymbol name="doc.text.fill" size={64} color={ThemeColors.orange} />
          <ThemedText style={styles.errorText}>Exam not found</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const colors = Colors[colorScheme ?? 'light'];
  const currentQuestion = exam.questions[currentQuestionIndex];
  const selectedAnswer = answers.get(currentQuestion.id);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!started) {
    return (
      <ThemedView style={styles.container}>
        <PremiumHeader
          title={exam.title}
          showBackButton={true}
        />
        <View style={styles.startContainer}>
          <ThemedView style={[styles.startCard, { backgroundColor: colors.card }]}>
            <LinearGradient
              colors={[ThemeColors.white + 'F5', ThemeColors.lightNeutral + 'F0', ThemeColors.white + 'E8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.startGradient}>
              <View style={styles.startContent}>
                {/* Premium Test Icon */}
                <View style={styles.startIconWrapper}>
                  <View style={[styles.startIconContainer, { backgroundColor: ThemeColors.orange + '25' }]}>
                    <LinearGradient
                      colors={[ThemeColors.orange, '#FF8C5A', ThemeColors.orange]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.startIconGradient}>
                      <View style={styles.startIconGlow} />
                      <IconSymbol name="doc.text.fill" size={72} color={ThemeColors.white} />
                    </LinearGradient>
                  </View>
                  <View style={styles.startIconRing} />
                </View>

                {/* Test Title */}
                <ThemedText type="title" style={styles.startTitle}>
                  {exam.title}
                </ThemedText>

                {/* Premium Detail Cards */}
                <View style={styles.startDetailsContainer}>
                  <View style={styles.startDetailItem}>
                    <LinearGradient
                      colors={[ThemeColors.white + 'F8', ThemeColors.lightNeutral + 'F5']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.detailItemGradient}>
                      <View style={[styles.detailIconContainer, { backgroundColor: ThemeColors.orange + '20' }]}>
                        <LinearGradient
                          colors={[ThemeColors.orange, '#FF8C5A']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.detailIconGradient}>
                          <IconSymbol name="list.bullet" size={24} color={ThemeColors.white} />
                        </LinearGradient>
                      </View>
                      <ThemedText style={styles.startDetails}>
                        {exam.questions.length} {exam.questions.length === 1 ? 'Question' : 'Questions'}
                      </ThemedText>
                    </LinearGradient>
                  </View>

                  <View style={styles.startDetailItem}>
                    <LinearGradient
                      colors={[ThemeColors.white + 'F8', ThemeColors.lightNeutral + 'F5']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.detailItemGradient}>
                      <View style={[styles.detailIconContainer, { backgroundColor: ThemeColors.orange + '20' }]}>
                        <LinearGradient
                          colors={[ThemeColors.orange, '#FF8C5A']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.detailIconGradient}>
                          <IconSymbol name="clock.fill" size={24} color={ThemeColors.white} />
                        </LinearGradient>
                      </View>
                      <ThemedText style={styles.startDetails}>
                        {exam.duration} {exam.duration === 1 ? 'minute' : 'minutes'}
                      </ThemedText>
                    </LinearGradient>
                  </View>

                  <View style={styles.startDetailItem}>
                    <LinearGradient
                      colors={[ThemeColors.white + 'F8', ThemeColors.lightNeutral + 'F5']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.detailItemGradient}>
                      <View style={[styles.detailIconContainer, { backgroundColor: ThemeColors.orange + '20' }]}>
                        <LinearGradient
                          colors={[ThemeColors.orange, '#FF8C5A']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.detailIconGradient}>
                          <IconSymbol name="star.fill" size={24} color={ThemeColors.white} />
                        </LinearGradient>
                      </View>
                      <ThemedText style={styles.startDetails}>
                        {exam.questions.reduce((sum, q) => sum + q.marks, 0)} {exam.questions.reduce((sum, q) => sum + q.marks, 0) === 1 ? 'Mark' : 'Marks'}
                      </ThemedText>
                    </LinearGradient>
                  </View>
                </View>

                {/* Premium Start Button */}
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={startExam}
                  activeOpacity={0.85}>
                  <LinearGradient
                    colors={[ThemeColors.orange, '#FF8C5A', ThemeColors.orange]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.startButtonGradient}>
                    <View style={styles.startButtonGlow} />
                    <IconSymbol name="play.fill" size={28} color={ThemeColors.white} />
                    <ThemedText style={{ color: ThemeColors.white, fontSize: 22, fontWeight: '900', marginLeft: 14, letterSpacing: 0.8 }}>
                      Start Exam
                    </ThemedText>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </ThemedView>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <PremiumHeader
        title={exam.title}
        showBackButton={true}
        subtitle={`Time: ${formatTime(timeRemaining)}`}
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <ThemedView style={[styles.questionCard, { backgroundColor: colors.card }]}>
          <LinearGradient
            colors={[ThemeColors.white + 'F8', ThemeColors.lightNeutral + 'F5', ThemeColors.white + 'F0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.questionGradient}>
            <View style={styles.questionHeader}>
              <View style={styles.questionBadge}>
                <LinearGradient
                  colors={[ThemeColors.orange + '20', ThemeColors.orange + '15']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.badgeGradient}>
                  <IconSymbol name="number.circle.fill" size={20} color={ThemeColors.orange} />
                  <ThemedText style={styles.questionNumber}>
                    Question {currentQuestionIndex + 1} of {exam.questions.length}
                  </ThemedText>
                </LinearGradient>
              </View>
              <View style={styles.marksBadge}>
                <LinearGradient
                  colors={[ThemeColors.deepBlue + '20', ThemeColors.deepBlue + '15']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.badgeGradient}>
                  <IconSymbol name="star.fill" size={18} color={ThemeColors.deepBlue} />
                  <ThemedText style={styles.questionMarks}>
                    {currentQuestion.marks} {currentQuestion.marks === 1 ? 'mark' : 'marks'}
                  </ThemedText>
                </LinearGradient>
              </View>
            </View>
            <ThemedText type="defaultSemiBold" style={styles.questionText}>
              {currentQuestion.question}
            </ThemedText>
            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: selectedAnswer === index 
                        ? ThemeColors.orange + '18' 
                        : ThemeColors.white + 'F8',
                      borderColor: selectedAnswer === index 
                        ? ThemeColors.orange 
                        : ThemeColors.white + '80',
                      borderWidth: selectedAnswer === index ? 3 : 2,
                    },
                  ]}
                  onPress={() => selectAnswer(currentQuestion.id, index)}
                  activeOpacity={0.75}>
                  <View style={styles.optionContent}>
                    <View
                      style={[
                        styles.optionCircle,
                        {
                          backgroundColor: selectedAnswer === index ? ThemeColors.orange : 'transparent',
                          borderColor: selectedAnswer === index ? ThemeColors.orange : ThemeColors.orange + '40',
                          borderWidth: selectedAnswer === index ? 3 : 2.5,
                        },
                      ]}>
                      {selectedAnswer === index && (
                        <LinearGradient
                          colors={[ThemeColors.orange, '#FF8C5A', ThemeColors.orange]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.optionCircleGradient}>
                          <View style={styles.optionCircleGlow} />
                          <IconSymbol name="checkmark" size={18} color={ThemeColors.white} />
                        </LinearGradient>
                      )}
                    </View>
                    <ThemedText style={styles.optionLabel}>
                      {String.fromCharCode(65 + index)}. {option}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </LinearGradient>
        </ThemedView>
      </ScrollView>

      <View style={[styles.navigationBar, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
          disabled={currentQuestionIndex === 0}
          activeOpacity={0.75}>
          <LinearGradient
            colors={currentQuestionIndex === 0 
              ? [colors.border + '80', colors.border + '60'] 
              : [ThemeColors.grayText + 'E0', ThemeColors.grayText + 'C0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.navButtonGradient}>
            <IconSymbol name="chevron.left" size={22} color={currentQuestionIndex === 0 ? colors.icon + '60' : ThemeColors.white} />
            <ThemedText style={{ 
              fontWeight: '800',
              color: currentQuestionIndex === 0 ? colors.icon + '60' : ThemeColors.white,
              marginLeft: 8,
              fontSize: 16
            }}>Previous</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
        <View style={styles.questionDots}>
          {exam.questions.map((_, index) => {
            const isCurrent = index === currentQuestionIndex;
            const isAnswered = answers.has(exam.questions[index].id);
            return (
              <TouchableOpacity
                key={index}
                onPress={() => setCurrentQuestionIndex(index)}
                activeOpacity={0.7}>
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: isCurrent
                        ? ThemeColors.orange
                        : isAnswered
                        ? ThemeColors.deepBlue
                        : colors.border + '80',
                      width: isCurrent ? 14 : 11,
                      height: isCurrent ? 14 : 11,
                      borderRadius: isCurrent ? 7 : 5.5,
                      borderWidth: isCurrent ? 2 : 0,
                      borderColor: isCurrent ? ThemeColors.white + '40' : 'transparent',
                    },
                  ]}>
                  {isAnswered && !isCurrent && (
                    <View style={styles.dotInner}>
                      <IconSymbol name="checkmark" size={7} color={ThemeColors.white} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        {currentQuestionIndex < exam.questions.length - 1 ? (
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
            activeOpacity={0.8}>
            <LinearGradient
              colors={[ThemeColors.orange, '#FF8C5A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.navButtonGradient}>
              <ThemedText style={{ color: ThemeColors.white, fontWeight: '800', marginRight: 8, fontSize: 16 }}>Next</ThemedText>
              <IconSymbol name="chevron.right" size={22} color={ThemeColors.white} />
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => {
              Alert.alert('Submit Exam', 'Are you sure you want to submit?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Submit', onPress: submitExam },
              ]);
            }}
            activeOpacity={0.8}>
            <LinearGradient
              colors={[ThemeColors.deepBlue, '#0A2E3D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.navButtonGradient}>
              <IconSymbol name="checkmark.circle.fill" size={22} color={ThemeColors.white} />
              <ThemedText style={{ color: ThemeColors.white, fontWeight: '900', marginLeft: 10, fontSize: 16 }}>Submit</ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: ThemeColors.orange + '08',
  },
  startCard: {
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: ThemeColors.white + '60',
    ...Platform.select({
      ios: {
        shadowColor: ThemeColors.orange,
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.25,
        shadowRadius: 32,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  startGradient: {
    padding: 40,
    borderWidth: 1,
    borderColor: ThemeColors.white + '40',
    borderRadius: 40,
  },
  startContent: {
    alignItems: 'center',
  },
  startIconWrapper: {
    position: 'relative',
    marginBottom: 32,
  },
  startIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: ThemeColors.white + '50',
    ...Platform.select({
      ios: {
        shadowColor: ThemeColors.orange,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  startIconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  startIconGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: ThemeColors.white + '25',
    borderRadius: 28,
  },
  startIconRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: ThemeColors.orange + '20',
    top: -10,
    left: -10,
  },
  startTitle: {
    marginBottom: 36,
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 40,
  },
  startDetailsContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 44,
  },
  startDetailItem: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: ThemeColors.white + '50',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  detailItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 22,
    gap: 18,
    borderRadius: 24,
  },
  detailIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: ThemeColors.orange,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  detailIconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startDetails: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.4,
    flex: 1,
  },
  startButton: {
    borderRadius: 28,
    overflow: 'hidden',
    width: '100%',
    borderWidth: 2,
    borderColor: ThemeColors.white + '40',
    ...Platform.select({
      ios: {
        shadowColor: ThemeColors.orange,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
      },
      android: {
        elevation: 14,
      },
    }),
  },
  startButtonGradient: {
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  startButtonGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: ThemeColors.white + '25',
    borderRadius: 28,
  },
  timerBar: {
    padding: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  content: {
    flex: 1,
    backgroundColor: ThemeColors.orange + '05',
  },
  contentContainer: {
    padding: 24,
  },
  questionCard: {
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: ThemeColors.white + '60',
    ...Platform.select({
      ios: {
        shadowColor: ThemeColors.orange,
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.2,
        shadowRadius: 28,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  questionGradient: {
    padding: 36,
    borderWidth: 1,
    borderColor: ThemeColors.white + '40',
    borderRadius: 32,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  questionBadge: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: ThemeColors.white + '50',
    ...Platform.select({
      ios: {
        shadowColor: ThemeColors.orange,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  badgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 12,
    borderRadius: 20,
  },
  questionNumber: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  marksBadge: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: ThemeColors.white + '50',
    ...Platform.select({
      ios: {
        shadowColor: ThemeColors.deepBlue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  questionMarks: {
    fontSize: 17,
    fontWeight: '900',
    color: ThemeColors.deepBlue,
    letterSpacing: 0.4,
  },
  questionText: {
    fontSize: 26,
    marginBottom: 36,
    lineHeight: 38,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  optionsContainer: {
    gap: 18,
  },
  optionButton: {
    borderRadius: 26,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  optionCircleGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  optionCircleGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: ThemeColors.white + '30',
    borderRadius: 20,
  },
  optionLabel: {
    flex: 1,
    fontSize: 19,
    fontWeight: '800',
    lineHeight: 28,
    letterSpacing: 0.3,
  },
  navigationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: ThemeColors.white + '20',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  navButton: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: ThemeColors.white + '30',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  navButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 20,
  },
  questionDots: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  dot: {
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  dotInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

