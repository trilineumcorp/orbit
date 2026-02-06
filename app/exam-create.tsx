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
import { Alert, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

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
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <ThemedView style={[styles.formCard, { backgroundColor: colors.card }]}>
          <LinearGradient
            colors={[ThemeColors.orange + '15', ThemeColors.deepBlue + '10']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.formGradient}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconWrapper}>
                <View style={[styles.sectionIconContainer, { backgroundColor: ThemeColors.orange + '25' }]}>
                  <LinearGradient
                    colors={[ThemeColors.orange, '#FF8C5A']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.sectionIconGradient}>
                    <IconSymbol name="doc.text.fill" size={24} color={ThemeColors.white} />
                  </LinearGradient>
                </View>
              </View>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Exam Details
              </ThemedText>
            </View>
          <View style={styles.inputContainer}>
            <View style={[styles.inputIconContainer, { backgroundColor: ThemeColors.orange + '15' }]}>
              <IconSymbol name="doc.text.fill" size={18} color={ThemeColors.orange} />
            </View>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Exam Title"
              placeholderTextColor={colors.icon}
              value={title}
              onChangeText={setTitle}
            />
          </View>
          <View style={styles.inputContainer}>
            <View style={[styles.inputIconContainer, { backgroundColor: ThemeColors.deepBlue + '15' }]}>
              <IconSymbol name="clock.fill" size={18} color={ThemeColors.deepBlue} />
            </View>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Duration (minutes)"
              placeholderTextColor={colors.icon}
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
            />
          </View>
          </LinearGradient>
        </ThemedView>

        <ThemedView style={[styles.formCard, { backgroundColor: colors.card }]}>
          <LinearGradient
            colors={[ThemeColors.deepBlue + '15', ThemeColors.orange + '10']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.formGradient}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconWrapper}>
                <View style={[styles.sectionIconContainer, { backgroundColor: ThemeColors.deepBlue + '25' }]}>
                  <LinearGradient
                    colors={[ThemeColors.deepBlue, '#0A2E3D']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.sectionIconGradient}>
                    <IconSymbol name="plus.circle.fill" size={24} color={ThemeColors.white} />
                  </LinearGradient>
                </View>
              </View>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Add Question ({questions.length} added)
              </ThemedText>
            </View>
          <View style={styles.textAreaContainer}>
            <View style={[styles.textAreaIconContainer, { backgroundColor: ThemeColors.orange + '15' }]}>
              <IconSymbol name="questionmark.circle.fill" size={18} color={ThemeColors.orange} />
            </View>
            <TextInput
              style={[styles.textArea, { color: colors.text, borderColor: colors.border }]}
              placeholder="Enter your question here..."
              placeholderTextColor={colors.icon}
              value={currentQuestion.question}
              onChangeText={(text) => setCurrentQuestion({ ...currentQuestion, question: text })}
              multiline
            />
          </View>
          {currentQuestion.options.map((option, index) => (
            <View key={index} style={styles.optionRow}>
              <TouchableOpacity
                style={[
                  styles.radioButton,
                  { borderColor: currentQuestion.correctAnswer === index ? ThemeColors.orange : colors.border },
                  currentQuestion.correctAnswer === index && { backgroundColor: ThemeColors.orange },
                ]}
                onPress={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: index })}
                activeOpacity={0.7}>
                {currentQuestion.correctAnswer === index && (
                  <View style={styles.radioInner} />
                )}
              </TouchableOpacity>
              <View style={styles.optionInputContainer}>
                <View style={[styles.optionLabelBadge, { backgroundColor: ThemeColors.orange + '20' }]}>
                  <ThemedText style={styles.optionLabelText}>{String.fromCharCode(65 + index)}</ThemedText>
                </View>
                <TextInput
                  style={[styles.optionInput, { color: colors.text, borderColor: colors.border }]}
                  placeholder={`Enter option ${String.fromCharCode(65 + index)}`}
                  placeholderTextColor={colors.icon}
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
          <View style={styles.marksRow}>
            <ThemedText style={{ fontWeight: '600' }}>Marks:</ThemedText>
            <TextInput
              style={[styles.marksInput, { color: colors.text, borderColor: colors.border }]}
              value={currentQuestion.marks}
              onChangeText={(text) => setCurrentQuestion({ ...currentQuestion, marks: text })}
              keyboardType="numeric"
            />
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={addQuestion}
            activeOpacity={0.8}>
            <LinearGradient
              colors={[ThemeColors.orange, '#FF8C5A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addButtonGradient}>
              <IconSymbol name="plus.circle.fill" size={20} color={ThemeColors.white} />
              <ThemedText style={{ color: ThemeColors.white, fontWeight: '700', marginLeft: 8 }}>Add Question</ThemedText>
            </LinearGradient>
          </TouchableOpacity>
          </LinearGradient>
        </ThemedView>

        {questions.length > 0 && (
          <ThemedView style={[styles.formCard, { backgroundColor: colors.card }]}>
            <LinearGradient
              colors={[ThemeColors.orange + '15', ThemeColors.deepBlue + '10']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.formGradient}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconWrapper}>
                  <View style={[styles.sectionIconContainer, { backgroundColor: ThemeColors.orange + '25' }]}>
                    <LinearGradient
                      colors={[ThemeColors.orange, '#FF8C5A']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.sectionIconGradient}>
                      <IconSymbol name="list.bullet.rectangle.fill" size={24} color={ThemeColors.white} />
                    </LinearGradient>
                  </View>
                </View>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Questions Preview ({questions.length})
                </ThemedText>
              </View>
              {questions.map((q, index) => (
                <View key={q.id} style={styles.questionPreview}>
                  <LinearGradient
                    colors={[ThemeColors.lightNeutral, ThemeColors.lightNeutral + 'DD']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.previewGradient}>
                    <View style={styles.previewHeader}>
                      <View style={[styles.previewNumberBadge, { backgroundColor: ThemeColors.orange + '25' }]}>
                        <LinearGradient
                          colors={[ThemeColors.orange, '#FF8C5A']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.previewNumberGradient}>
                          <ThemedText style={styles.previewNumber}>Q{index + 1}</ThemedText>
                        </LinearGradient>
                      </View>
                      <View style={[styles.previewMarksBadge, { backgroundColor: ThemeColors.deepBlue + '20' }]}>
                        <IconSymbol name="star.fill" size={12} color={ThemeColors.deepBlue} />
                        <ThemedText style={styles.previewMarks}>{q.marks} pts</ThemedText>
                      </View>
                    </View>
                    <ThemedText style={styles.previewQuestion}>{q.question}</ThemedText>
                    <View style={styles.previewOptions}>
                      {q.options.map((opt, i) => (
                        <View key={i} style={[
                          styles.previewOption,
                          i === q.correctAnswer && styles.previewOptionCorrect
                        ]}>
                          <View style={[
                            styles.previewOptionCircle,
                            i === q.correctAnswer && { backgroundColor: '#4CAF50' }
                          ]}>
                            {i === q.correctAnswer && (
                              <IconSymbol name="checkmark" size={10} color={ThemeColors.white} />
                            )}
                          </View>
                          <ThemedText style={[
                            styles.previewOptionText,
                            i === q.correctAnswer && styles.previewOptionTextCorrect
                          ]}>
                            {String.fromCharCode(65 + i)}. {opt}
                          </ThemedText>
                        </View>
                      ))}
                    </View>
                  </LinearGradient>
                </View>
              ))}
            </LinearGradient>
          </ThemedView>
        )}

        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveExam}
          activeOpacity={0.8}>
          <LinearGradient
            colors={[ThemeColors.deepBlue, '#0A2E3D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveButtonGradient}>
            <IconSymbol name="checkmark.circle.fill" size={24} color={ThemeColors.white} />
            <ThemedText style={{ color: ThemeColors.white, fontSize: 18, fontWeight: '800', marginLeft: 10 }}>
              Save Exam
            </ThemedText>
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
    borderRadius: 24,
    marginBottom: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  formGradient: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    gap: 16,
  },
  sectionIconWrapper: {
    position: 'relative',
  },
  sectionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: ThemeColors.white + '30',
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
  sectionIconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontWeight: '900',
    fontSize: 24,
    letterSpacing: 0.5,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  inputIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    fontWeight: '600',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  textAreaContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  textAreaIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  textArea: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    fontWeight: '600',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  radioButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2.5,
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: ThemeColors.white,
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
    fontWeight: '800',
    color: ThemeColors.orange,
  },
  optionInput: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    fontWeight: '600',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  marksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  marksInput: {
    width: 70,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    marginLeft: 14,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  addButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: ThemeColors.orange,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  addButtonGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionPreview: {
    marginBottom: 16,
    borderRadius: 18,
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
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  previewNumber: {
    color: ThemeColors.white,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
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
    fontSize: 12,
    fontWeight: '700',
    color: ThemeColors.deepBlue,
  },
  previewQuestion: {
    fontWeight: '700',
    marginBottom: 16,
    fontSize: 16,
    lineHeight: 24,
  },
  previewOptions: {
    gap: 10,
  },
  previewOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: ThemeColors.lightNeutral + '80',
    gap: 12,
  },
  previewOptionCorrect: {
    backgroundColor: '#4CAF5020',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  previewOptionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: ThemeColors.grayText + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewOptionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  previewOptionTextCorrect: {
    color: '#4CAF50',
    fontWeight: '700',
  },
  saveButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 40,
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: ThemeColors.deepBlue,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  saveButtonGradient: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

