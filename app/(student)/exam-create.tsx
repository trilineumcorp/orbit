import { PremiumHeader } from '@/components/premium-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getExams, saveExams } from '@/services/storage';
import { Exam, Question } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View, Animated } from 'react-native';

export default function ExamCreateScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    marks: '1',
  });

  const colors = Colors[colorScheme ?? 'light'];

  const addQuestion = () => {
    if (!currentQuestion.question.trim() || currentQuestion.options.some(opt => !opt.trim())) {
      Alert.alert('Error', 'Please fill in all question fields');
      return;
    }

    const newQuestion: Question = {
      id: Date.now().toString(),
      question: currentQuestion.question,
      options: currentQuestion.options,
      correctAnswer: currentQuestion.correctAnswer,
      marks: parseInt(currentQuestion.marks) || 1,
    };

    setQuestions([...questions, newQuestion]);
    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      marks: '1',
    });
    Alert.alert('Success', 'Question added');
  };

  const saveExam = async () => {
    if (!title.trim() || !duration.trim() || questions.length === 0) {
      Alert.alert('Error', 'Please fill in exam title, duration, and add at least one question');
      return;
    }

    const newExam: Exam = {
      id: Date.now().toString(),
      title,
      duration: parseInt(duration) || 60,
      questions,
    };

    const exams = await getExams();
    exams.push(newExam);
    await saveExams(exams);
    Alert.alert('Success', 'Exam created successfully');
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <PremiumHeader
        title="Create Exam"
        showBackButton={true}
      />
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer} 
        showsVerticalScrollIndicator={false}
      >
        {/* Exam Details Card */}
        <ThemedView style={[styles.formCard, { backgroundColor: colors.card }]}>
          <LinearGradient
            colors={[ThemeColors.orange + '08', ThemeColors.deepBlue + '05']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.formGradient}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconWrapper}>
                <LinearGradient
                  colors={[ThemeColors.orange, '#5DAFC7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.sectionIconGradient}
                >
                  <IconSymbol name="doc.text.fill" size={24} color={ThemeColors.white} />
                </LinearGradient>
              </View>
              <View>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Exam Details
                </ThemedText>
                <ThemedText style={styles.sectionSubtitle}>
                  Basic information about your exam
                </ThemedText>
              </View>
            </View>
          
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Exam Title</ThemedText>
              <View style={styles.inputContainer}>
                <View style={[styles.inputIconContainer, { backgroundColor: ThemeColors.orange + '15' }]}>
                  <IconSymbol name="doc.text.fill" size={18} color={ThemeColors.orange} />
                </View>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  placeholder="e.g., Mathematics Final Exam"
                  placeholderTextColor={colors.icon + '80'}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Duration (minutes)</ThemedText>
              <View style={styles.inputContainer}>
                <View style={[styles.inputIconContainer, { backgroundColor: ThemeColors.deepBlue + '15' }]}>
                  <IconSymbol name="clock.fill" size={18} color={ThemeColors.deepBlue} />
                </View>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  placeholder="e.g., 60"
                  placeholderTextColor={colors.icon + '80'}
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </LinearGradient>
        </ThemedView>

        {/* Add Question Card */}
        <ThemedView style={[styles.formCard, { backgroundColor: colors.card }]}>
          <LinearGradient
            colors={[ThemeColors.deepBlue + '05', ThemeColors.orange + '05']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.formGradient}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconWrapper}>
                <LinearGradient
                  colors={[ThemeColors.deepBlue, '#0A2E3D']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.sectionIconGradient}
                >
                  <IconSymbol name="plus.circle.fill" size={24} color={ThemeColors.white} />
                </LinearGradient>
              </View>
              <View>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Add Question
                </ThemedText>
                <ThemedText style={styles.sectionSubtitle}>
                  {questions.length} {questions.length === 1 ? 'question' : 'questions'} added
                </ThemedText>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Question</ThemedText>
              <View style={styles.textAreaContainer}>
                <TextInput
                  style={[styles.textArea, { color: colors.text, borderColor: colors.border }]}
                  placeholder="Enter your question here..."
                  placeholderTextColor={colors.icon + '80'}
                  value={currentQuestion.question}
                  onChangeText={(text) => setCurrentQuestion({ ...currentQuestion, question: text })}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Answer Options</ThemedText>
              {currentQuestion.options.map((option, index) => (
                <View key={index} style={styles.optionRow}>
                  <TouchableOpacity
                    style={[
                      styles.radioButton,
                      { borderColor: currentQuestion.correctAnswer === index ? ThemeColors.orange : colors.border + '40' },
                      currentQuestion.correctAnswer === index && { backgroundColor: ThemeColors.orange },
                    ]}
                    onPress={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: index })}
                    activeOpacity={0.7}
                  >
                    {currentQuestion.correctAnswer === index && (
                      <IconSymbol name="checkmark" size={16} color={ThemeColors.white} />
                    )}
                  </TouchableOpacity>
                  <View style={styles.optionInputContainer}>
                    <View style={[styles.optionLabelBadge, { backgroundColor: ThemeColors.orange + '15' }]}>
                      <ThemedText style={styles.optionLabelText}>
                        {String.fromCharCode(65 + index)}
                      </ThemedText>
                    </View>
                    <TextInput
                      style={[styles.optionInput, { color: colors.text, borderColor: colors.border + '40' }]}
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      placeholderTextColor={colors.icon + '60'}
                      value={option}
                      onChangeText={(text) => {
                        const newOptions = [...currentQuestion.options];
                        newOptions[index] = text;
                        setCurrentQuestion({ ...currentQuestion, options: newOptions });
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.marksContainer}>
              <ThemedText style={styles.inputLabel}>Points</ThemedText>
              <View style={styles.marksRow}>
                <TextInput
                  style={[styles.marksInput, { color: colors.text, borderColor: colors.border + '40' }]}
                  value={currentQuestion.marks}
                  onChangeText={(text) => setCurrentQuestion({ ...currentQuestion, marks: text })}
                  keyboardType="numeric"
                  placeholder="1"
                  placeholderTextColor={colors.icon + '60'}
                />
                <ThemedText style={styles.marksHint}>points for this question</ThemedText>
              </View>
            </View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={addQuestion}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[ThemeColors.orange, '#FF8C5A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.addButtonGradient}
              >
                <IconSymbol name="plus.circle.fill" size={20} color={ThemeColors.white} />
                <ThemedText style={styles.addButtonText}>Add Question</ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </ThemedView>

        {/* Questions Preview */}
        {questions.length > 0 && (
          <ThemedView style={[styles.formCard, { backgroundColor: colors.card }]}>
            <LinearGradient
              colors={[ThemeColors.orange + '05', ThemeColors.deepBlue + '05']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.formGradient}
            >
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconWrapper}>
                  <LinearGradient
                    colors={[ThemeColors.orange, '#FF8C5A']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.sectionIconGradient}
                  >
                    <IconSymbol name="list.bullet.rectangle.fill" size={24} color={ThemeColors.white} />
                  </LinearGradient>
                </View>
                <View>
                  <ThemedText type="subtitle" style={styles.sectionTitle}>
                    Questions Preview
                  </ThemedText>
                  <ThemedText style={styles.sectionSubtitle}>
                    Review your questions before saving
                  </ThemedText>
                </View>
              </View>

              {questions.map((q, index) => (
                <View key={q.id} style={styles.questionPreview}>
                  <LinearGradient
                    colors={[colors.card + '80', colors.card]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.previewGradient}
                  >
                    <View style={styles.previewHeader}>
                      <View style={styles.previewNumberBadge}>
                        <LinearGradient
                          colors={[ThemeColors.orange, '#FF8C5A']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.previewNumberGradient}
                        >
                          <ThemedText style={styles.previewNumber}>Q{index + 1}</ThemedText>
                        </LinearGradient>
                      </View>
                      <View style={[styles.previewMarksBadge, { backgroundColor: ThemeColors.deepBlue + '15' }]}>
                        <IconSymbol name="star.fill" size={12} color={ThemeColors.deepBlue} />
                        <ThemedText style={[styles.previewMarks, { color: ThemeColors.deepBlue }]}>
                          {q.marks} {q.marks === 1 ? 'point' : 'points'}
                        </ThemedText>
                      </View>
                    </View>

                    <ThemedText style={styles.previewQuestionText}>
                      {q.question}
                    </ThemedText>

                    <View style={styles.previewOptions}>
                      {q.options.map((opt, i) => (
                        <View 
                          key={i} 
                          style={[
                            styles.previewOption,
                            i === q.correctAnswer && styles.previewOptionCorrect
                          ]}
                        >
                          <View style={[
                            styles.previewOptionCircle,
                            i === q.correctAnswer && styles.previewOptionCircleCorrect
                          ]}>
                            <ThemedText style={[
                              styles.previewOptionLetter,
                              i === q.correctAnswer && styles.previewOptionLetterCorrect
                            ]}>
                              {String.fromCharCode(65 + i)}
                            </ThemedText>
                          </View>
                          <ThemedText style={[
                            styles.previewOptionText,
                            i === q.correctAnswer && styles.previewOptionTextCorrect
                          ]}>
                            {opt}
                          </ThemedText>
                          {i === q.correctAnswer && (
                            <View style={styles.correctBadge}>
                              <IconSymbol name="checkmark.circle.fill" size={16} color="#4CAF50" />
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  </LinearGradient>
                </View>
              ))}
            </LinearGradient>
          </ThemedView>
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveExam}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[ThemeColors.deepBlue, '#1A3A4A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveButtonGradient}
          >
            <IconSymbol name="checkmark.circle.fill" size={28} color={ThemeColors.white} />
            <View style={styles.saveButtonTextContainer}>
              <ThemedText style={styles.saveButtonText}>
                Save Exam
              </ThemedText>
              <ThemedText style={styles.saveButtonSubtext}>
                {questions.length} {questions.length === 1 ? 'question' : 'questions'} • {duration || '0'} minutes
              </ThemedText>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  formCard: {
    borderRadius: 28,
    marginBottom: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  formGradient: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  sectionIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 18,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: ThemeColors.orange,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sectionIconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  textAreaContainer: {
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 18,
    fontSize: 16,
    minHeight: 120,
    fontWeight: '500',
    lineHeight: 24,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radioButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  optionLabelBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLabelText: {
    fontSize: 16,
    fontWeight: '700',
    color: ThemeColors.orange,
  },
  optionInput: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
    fontSize: 15,
    fontWeight: '500',
  },
  marksContainer: {
    marginBottom: 20,
  },
  marksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  marksInput: {
    width: 80,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  marksHint: {
    fontSize: 14,
    opacity: 0.7,
  },
  addButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: ThemeColors.orange,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  addButtonGradient: {
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonText: {
    color: ThemeColors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  questionPreview: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  previewGradient: {
    padding: 20,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewNumberBadge: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewNumberGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  previewNumber: {
    color: ThemeColors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  previewMarksBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  previewMarks: {
    fontSize: 13,
    fontWeight: '600',
  },
  previewQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 18,
    lineHeight: 24,
  },
  previewOptions: {
    gap: 10,
  },
  previewOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.02)',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  previewOptionCorrect: {
    backgroundColor: '#4CAF5010',
    borderColor: '#4CAF50',
    borderWidth: 1.5,
  },
  previewOptionCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewOptionCircleCorrect: {
    backgroundColor: '#4CAF50',
  },
  previewOptionLetter: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
  },
  previewOptionLetterCorrect: {
    color: ThemeColors.white,
    opacity: 1,
  },
  previewOptionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
  previewOptionTextCorrect: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  correctBadge: {
    marginLeft: 'auto',
  },
  saveButton: {
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: ThemeColors.deepBlue,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  saveButtonGradient: {
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  saveButtonTextContainer: {
    alignItems: 'flex-start',
  },
  saveButtonText: {
    color: ThemeColors.white,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  saveButtonSubtext: {
    color: ThemeColors.white,
    fontSize: 13,
    opacity: 0.8,
    fontWeight: '500',
  },
});