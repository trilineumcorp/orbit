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
import React, { useEffect, useState, useRef } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, TouchableOpacity, View, Animated, Easing } from 'react-native';

export default function ExamTakeScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [exam, setExam] = useState<Exam | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, number>>(new Map());
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [started, setStarted] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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

  useEffect(() => {
    if (started) {
      // Animate content appearance
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.2)),
        }),
      ]).start();

      // Update progress bar
      Animated.timing(progressAnim, {
        toValue: (currentQuestionIndex + 1) / exam!.questions.length,
        duration: 300,
        useNativeDriver: false,
      }).start();

      // Pulse animation for low time
      if (timeRemaining < 60) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.05,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        ).start();
      } else {
        pulseAnim.setValue(1);
      }
    }
  }, [started, currentQuestionIndex, timeRemaining]);

  const loadExam = async () => {
    const exams = await getExams();
    const found = exams.find(e => e.id === params.examId);
    if (found) {
      setExam(found);
      setTimeRemaining(found.duration * 60);
    }
  };

  const startExam = () => {
    Alert.alert(
      'Ready to Begin?',
      'Make sure you have a quiet environment and enough time to complete the exam.',
      [
        { text: 'Not Yet', style: 'cancel' },
        {
          text: 'Start Exam',
          onPress: () => {
            setStarted(true);
            setTimeRemaining(exam!.duration * 60);
          },
        },
      ]
    );
  };

  const selectAnswer = (questionId: string, optionIndex: number) => {
    const newAnswers = new Map(answers);
    newAnswers.set(questionId, optionIndex);
    setAnswers(newAnswers);
    
    // Haptic feedback (if available)
    if (Platform.OS === 'ios') {
      const impactFeedback = () => {};
      impactFeedback();
    }
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
    
    Alert.alert(
      '🎉 Exam Completed!',
      `Your Score: ${score}/${totalMarks}\nPercentage: ${result.percentage.toFixed(1)}%\n\nGreat job!`,
      [
        { 
          text: 'View Results', 
          onPress: () => router.push(`/exam/results/${exam.id}`) 
        },
        { text: 'Close', onPress: () => router.back() },
      ]
    );
  };

  if (!exam) {
    return (
      <ThemedView style={styles.container}>
        <PremiumHeader
          title="Exam"
          showBackButton={true}
        />
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <IconSymbol name="exclamationmark.triangle" size={48} color={ThemeColors.orange} />
          </View>
          <ThemedText style={styles.errorTitle}>Exam Not Found</ThemedText>
          <ThemedText style={styles.errorText}>The exam you're looking for doesn't exist or has been removed.</ThemedText>
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

  const progress = ((currentQuestionIndex + 1) / exam.questions.length) * 100;

  if (!started) {
    return (
      <ThemedView style={styles.container}>
        <PremiumHeader
          title="Exam Details"
          showBackButton={true}
        />
        <ScrollView contentContainerStyle={styles.startScrollContent}>
          <View style={styles.startContainer}>
            <View style={styles.premiumBadge}>
              <LinearGradient
                colors={[ThemeColors.orange + '20', ThemeColors.orange + '10']}
                style={styles.premiumBadgeGradient}>
                <IconSymbol name="crown.fill" size={16} color={ThemeColors.orange} />
                <ThemedText style={styles.premiumBadgeText}>Premium Assessment</ThemedText>
              </LinearGradient>
            </View>

            <ThemedView style={[styles.startCard, { backgroundColor: colors.card }]}>
              <LinearGradient
                colors={['#FFFFFF', ThemeColors.lightNeutral + '80', '#FFFFFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.startGradient}>
                
                {/* Decorative Elements */}
                <View style={styles.decorCircle1} />
                <View style={styles.decorCircle2} />
                
                <View style={styles.startContent}>
                  <View style={styles.iconWrapper}>
                    <LinearGradient
                      colors={[ThemeColors.orange, '#FF9F6E', ThemeColors.orange]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.iconGradient}>
                      <View style={styles.iconInnerGlow} />
                      <IconSymbol name="doc.text.magnifyingglass" size={56} color="#FFFFFF" />
                    </LinearGradient>
                    <View style={styles.iconRing} />
                    <View style={styles.iconRing2} />
                  </View>

                  <ThemedText type="title" style={styles.examTitle}>
                    {exam.title}
                  </ThemedText>

                  <View style={styles.detailGrid}>
                    <View style={styles.detailRow}>
                      <View style={styles.detailItem}>
                        <LinearGradient
                          colors={[ThemeColors.orange + '15', ThemeColors.orange + '05']}
                          style={styles.detailItemInner}>
                          <View style={[styles.detailIcon, { backgroundColor: ThemeColors.orange + '20' }]}>
                            <IconSymbol name="list.bullet.rectangle" size={24} color={ThemeColors.orange} />
                          </View>
                          <View style={styles.detailTextContainer}>
                            <ThemedText style={styles.detailLabel}>Questions</ThemedText>
                            <ThemedText style={styles.detailValue}>{exam.questions.length}</ThemedText>
                          </View>
                        </LinearGradient>
                      </View>

                      <View style={styles.detailItem}>
                        <LinearGradient
                          colors={[ThemeColors.orange + '15', ThemeColors.orange + '05']}
                          style={styles.detailItemInner}>
                          <View style={[styles.detailIcon, { backgroundColor: ThemeColors.orange + '20' }]}>
                            <IconSymbol name="clock" size={24} color={ThemeColors.orange} />
                          </View>
                          <View style={styles.detailTextContainer}>
                            <ThemedText style={styles.detailLabel}>Duration</ThemedText>
                            <ThemedText style={styles.detailValue}>{exam.duration} min</ThemedText>
                          </View>
                        </LinearGradient>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <View style={styles.detailItem}>
                        <LinearGradient
                          colors={[ThemeColors.orange + '15', ThemeColors.orange + '05']}
                          style={styles.detailItemInner}>
                          <View style={[styles.detailIcon, { backgroundColor: ThemeColors.orange + '20' }]}>
                            <IconSymbol name="star" size={24} color={ThemeColors.orange} />
                          </View>
                          <View style={styles.detailTextContainer}>
                            <ThemedText style={styles.detailLabel}>Total Marks</ThemedText>
                            <ThemedText style={styles.detailValue}>
                              {exam.questions.reduce((sum, q) => sum + q.marks, 0)}
                            </ThemedText>
                          </View>
                        </LinearGradient>
                      </View>

                      <View style={styles.detailItem}>
                        <LinearGradient
                          colors={[ThemeColors.orange + '15', ThemeColors.orange + '05']}
                          style={styles.detailItemInner}>
                          <View style={[styles.detailIcon, { backgroundColor: ThemeColors.orange + '20' }]}>
                            <IconSymbol name="chart.bar" size={24} color={ThemeColors.orange} />
                          </View>
                          <View style={styles.detailTextContainer}>
                            <ThemedText style={styles.detailLabel}>Passing</ThemedText>
                            <ThemedText style={styles.detailValue}>70%</ThemedText>
                          </View>
                        </LinearGradient>
                      </View>
                    </View>
                  </View>

                  <View style={styles.infoCard}>
                    <IconSymbol name="info.circle.fill" size={20} color={ThemeColors.orange} />
                    <ThemedText style={styles.infoText}>
                      Take your time and read each question carefully. You can navigate between questions anytime.
                    </ThemedText>
                  </View>

                  <TouchableOpacity
                    style={styles.startButton}
                    onPress={startExam}
                    activeOpacity={0.9}>
                    <LinearGradient
                      colors={[ThemeColors.orange, '#FF8C5A', ThemeColors.orange]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.startButtonGradient}>
                      <View style={styles.startButtonGlow} />
                      <IconSymbol name="play.fill" size={24} color="#FFFFFF" />
                      <ThemedText style={styles.startButtonText}>Begin Assessment</ThemedText>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </ThemedView>
          </View>
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <PremiumHeader
        title={exam.title}
        showBackButton={true}
        rightComponent={
          <Animated.View style={[styles.timerContainer, { transform: [{ scale: pulseAnim }] }]}>
            <LinearGradient
              colors={timeRemaining < 60 ? ['#FF3B30', '#FF6B6B'] : [ThemeColors.orange, '#FF8C5A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.timerGradient}>
              <IconSymbol name="clock.fill" size={16} color="#FFFFFF" />
              <ThemedText style={styles.timerText}>{formatTime(timeRemaining)}</ThemedText>
            </LinearGradient>
          </Animated.View>
        }
      />

      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View 
            style={[
              styles.progressBarFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                })
              }
            ]}>
            <LinearGradient
              colors={[ThemeColors.orange, '#FF8C5A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>
        <ThemedText style={styles.progressText}>
          {currentQuestionIndex + 1}/{exam.questions.length}
        </ThemedText>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer} 
        showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}>
          <ThemedView style={[styles.questionCard, { backgroundColor: colors.card }]}>
            <LinearGradient
              colors={['#FFFFFF', ThemeColors.lightNeutral + '80', '#FFFFFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.questionGradient}>
              
              <View style={styles.questionHeader}>
                <View style={styles.questionBadge}>
                  <LinearGradient
                    colors={[ThemeColors.orange + '15', ThemeColors.orange + '05']}
                    style={styles.questionBadgeInner}>
                    <IconSymbol name="questionmark.circle.fill" size={18} color={ThemeColors.orange} />
                    <ThemedText style={styles.questionNumber}>
                      Question {currentQuestionIndex + 1}
                    </ThemedText>
                  </LinearGradient>
                </View>
                
                <View style={styles.marksBadge}>
                  <LinearGradient
                    colors={[ThemeColors.deepBlue + '15', ThemeColors.deepBlue + '05']}
                    style={styles.marksBadgeInner}>
                    <IconSymbol name="star.fill" size={16} color={ThemeColors.deepBlue} />
                    <ThemedText style={styles.marksText}>
                      {currentQuestion.marks} {currentQuestion.marks === 1 ? 'mark' : 'marks'}
                    </ThemedText>
                  </LinearGradient>
                </View>
              </View>

              <ThemedText style={styles.questionText}>
                {currentQuestion.question}
              </ThemedText>

              <View style={styles.optionsContainer}>
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const letter = String.fromCharCode(65 + index);
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.optionButton,
                        isSelected && styles.optionButtonSelected
                      ]}
                      onPress={() => selectAnswer(currentQuestion.id, index)}
                      activeOpacity={0.7}>
                      <LinearGradient
                        colors={isSelected 
                          ? [ThemeColors.orange + '08', ThemeColors.orange + '02']
                          : ['#FFFFFF', '#FFFFFF']
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.optionGradient}>
                        <View style={[
                          styles.optionLetter,
                          isSelected && styles.optionLetterSelected
                        ]}>
                          <ThemedText style={[
                            styles.optionLetterText,
                            isSelected && styles.optionLetterTextSelected
                          ]}>
                            {letter}
                          </ThemedText>
                        </View>
                        
                        <ThemedText style={[
                          styles.optionText,
                          isSelected && styles.optionTextSelected
                        ]}>
                          {option}
                        </ThemedText>

                        {isSelected && (
                          <View style={styles.checkmark}>
                            <IconSymbol name="checkmark.circle.fill" size={22} color={ThemeColors.orange} />
                          </View>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </LinearGradient>
          </ThemedView>
        </Animated.View>
      </ScrollView>

      <View style={[styles.navigationBar, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[styles.navButton, currentQuestionIndex === 0 && styles.navButtonDisabled]}
          onPress={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
          disabled={currentQuestionIndex === 0}
          activeOpacity={0.7}>
          <LinearGradient
            colors={currentQuestionIndex === 0 
              ? ['#E0E0E0', '#D0D0D0']
              : [ThemeColors.orange + '80', ThemeColors.orange]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.navButtonGradient}>
            <IconSymbol 
              name="chevron.left" 
              size={20} 
              color={currentQuestionIndex === 0 ? '#999999' : '#FFFFFF'} 
            />
            <ThemedText style={[
              styles.navButtonText,
              currentQuestionIndex === 0 && styles.navButtonTextDisabled
            ]}>
              Previous
            </ThemedText>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.navCenter}>
          <View style={styles.questionDots}>
            {exam.questions.map((_, index) => {
              const isAnswered = answers.has(exam.questions[index].id);
              const isCurrent = index === currentQuestionIndex;
              
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => setCurrentQuestionIndex(index)}
                  activeOpacity={0.7}>
                  <View style={[
                    styles.dot,
                    isCurrent && styles.dotCurrent,
                    isAnswered && !isCurrent && styles.dotAnswered
                  ]}>
                    {isAnswered && !isCurrent && (
                      <IconSymbol name="checkmark" size={8} color="#FFFFFF" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {currentQuestionIndex < exam.questions.length - 1 ? (
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
            activeOpacity={0.7}>
            <LinearGradient
              colors={[ThemeColors.orange, '#FF8C5A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.navButtonGradient}>
              <ThemedText style={styles.navButtonText}>Next</ThemedText>
              <IconSymbol name="chevron.right" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => {
              Alert.alert(
                'Submit Exam',
                `You've answered ${answers.size} out of ${exam.questions.length} questions. Ready to submit?`,
                [
                  { text: 'Review', style: 'cancel' },
                  { text: 'Submit', onPress: submitExam, style: 'destructive' },
                ]
              );
            }}
            activeOpacity={0.7}>
            <LinearGradient
              colors={[ThemeColors.deepBlue, '#1A4A60']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.navButtonGradient}>
              <IconSymbol name="checkmark.circle.fill" size={20} color="#FFFFFF" />
              <ThemedText style={styles.navButtonText}>Submit</ThemedText>
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
    padding: 32,
  },
  errorIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: ThemeColors.orange + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 24,
  },
  startScrollContent: {
    flexGrow: 1,
  },
  startContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  premiumBadge: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  premiumBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: ThemeColors.orange + '20',
  },
  premiumBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: ThemeColors.orange,
    letterSpacing: 0.5,
  },
  startCard: {
    borderRadius: 48,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: ThemeColors.orange,
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.2,
        shadowRadius: 30,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  startGradient: {
    padding: 32,
    position: 'relative',
  },
  decorCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: ThemeColors.orange + '05',
    top: -50,
    right: -50,
  },
  decorCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: ThemeColors.orange + '05',
    bottom: -30,
    left: -30,
  },
  startContent: {
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  iconWrapper: {
    position: 'relative',
    marginBottom: 32,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
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
  iconInnerGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    opacity: 0.2,
    borderRadius: 32,
  },
  iconRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: ThemeColors.orange + '30',
    top: -10,
    left: -10,
  },
  iconRing2: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 44,
    borderWidth: 1,
    borderColor: ThemeColors.orange + '20',
    top: -20,
    left: -20,
  },
  examTitle: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: 0.5,
  },
  detailGrid: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 12,
  },
  detailItem: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  detailItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  detailIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 2,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 20,
    fontWeight: '900',
    color: ThemeColors.orange,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: ThemeColors.orange + '08',
    borderRadius: 20,
    padding: 16,
    gap: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: ThemeColors.orange + '15',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  startButton: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: ThemeColors.orange,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
    position: 'relative',
  },
  startButtonGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    opacity: 0.2,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  timerContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  timerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: ThemeColors.orange + '15',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressText: {
    fontSize: 16,
    fontWeight: '800',
    color: ThemeColors.orange,
    minWidth: 50,
    textAlign: 'right',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 8,
  },
  questionCard: {
    borderRadius: 32,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: ThemeColors.orange,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  questionGradient: {
    padding: 28,
    position: 'relative',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  questionBadge: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  questionBadgeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: ThemeColors.orange,
  },
  marksBadge: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  marksBadgeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  marksText: {
    fontSize: 16,
    fontWeight: '900',
    color: ThemeColors.deepBlue,
  },
  questionText: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 28,
    lineHeight: 34,
    letterSpacing: 0.3,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  optionButtonSelected: {
    borderColor: ThemeColors.orange,
  },
  optionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  optionLetter: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: ThemeColors.orange + '08',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLetterSelected: {
    backgroundColor: ThemeColors.orange,
  },
  optionLetterText: {
    fontSize: 20,
    fontWeight: '900',
    color: ThemeColors.orange,
  },
  optionLetterTextSelected: {
    color: '#FFFFFF',
  },
  optionText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
  },
  optionTextSelected: {
    fontWeight: '800',
    color: ThemeColors.orange,
  },
  checkmark: {
    marginLeft: 'auto',
  },
  navigationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: ThemeColors.orange + '15',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  navButton: {
    borderRadius: 20,
    overflow: 'hidden',
    flex: 1,
    maxWidth: 110,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  navButtonTextDisabled: {
    color: '#999999',
  },
  navCenter: {
    flex: 1,
    alignItems: 'center',
  },
  questionDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: ThemeColors.orange + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotCurrent: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: ThemeColors.orange,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  dotAnswered: {
    backgroundColor: ThemeColors.deepBlue,
  },
});