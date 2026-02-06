import { PremiumHeader } from '@/components/premium-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getOMRResults } from '@/services/storage';
import { OMRResult } from '@/types';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';

export default function OMRResultScreen() {
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const [result, setResult] = useState<OMRResult | null>(null);

  useEffect(() => {
    loadResult();
  }, []);

  const loadResult = async () => {
    const results = await getOMRResults();
    const found = results.find(r => r.id === params.resultId);
    setResult(found || null);
  };

  if (!result) {
    return (
      <ThemedView style={styles.container}>
        <PremiumHeader
          title="OMR Result"
          showBackButton={true}
        />
        <View style={styles.errorContainer}>
          <IconSymbol name="doc.text.fill" size={64} color={ThemeColors.orange} />
          <ThemedText style={styles.errorText}>Result not found</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const colors = Colors[colorScheme ?? 'light'];
  const percentage = (result.score / result.totalQuestions) * 100;

  return (
    <ThemedView style={styles.container}>
      <PremiumHeader
        title="OMR Result"
        showBackButton={true}
      />
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <ThemedView style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <View style={styles.studentHeader}>
            <View style={[styles.studentIconContainer, { backgroundColor: ThemeColors.orange + '20' }]}>
              <IconSymbol name="person.fill" size={32} color={ThemeColors.orange} />
            </View>
            <View style={styles.studentInfo}>
              <ThemedText type="title" style={styles.studentName}>
                {result.studentName}
              </ThemedText>
              <View style={styles.detailRow}>
                <IconSymbol name="number.circle.fill" size={14} color={colors.icon} />
                <ThemedText style={styles.detail}>Roll: {result.rollNumber}</ThemedText>
              </View>
              <View style={styles.detailRow}>
                <IconSymbol name="doc.text.fill" size={14} color={colors.icon} />
                <ThemedText style={styles.detail}>{result.examName}</ThemedText>
              </View>
            </View>
          </View>
          <View style={styles.scoreContainer}>
            <View style={[styles.scoreBox, styles.scoreBoxShadow]}>
              <View style={[styles.scoreIconContainer, { backgroundColor: ThemeColors.orange + '20' }]}>
                <IconSymbol name="checkmark.circle.fill" size={24} color={ThemeColors.orange} />
              </View>
              <ThemedText type="title" style={[styles.score, { color: ThemeColors.orange }]}>
                {result.score}
              </ThemedText>
              <ThemedText style={styles.scoreLabel}>Score</ThemedText>
            </View>
            <View style={[styles.scoreBox, styles.scoreBoxShadow]}>
              <View style={[styles.scoreIconContainer, { backgroundColor: ThemeColors.deepBlue + '20' }]}>
                <IconSymbol name="list.bullet" size={24} color={ThemeColors.deepBlue} />
              </View>
              <ThemedText type="title" style={[styles.score, { color: ThemeColors.deepBlue }]}>
                {result.totalQuestions}
              </ThemedText>
              <ThemedText style={styles.scoreLabel}>Total</ThemedText>
            </View>
            <View style={[styles.scoreBox, styles.scoreBoxShadow]}>
              <View style={[styles.scoreIconContainer, { backgroundColor: (percentage >= 50 ? '#4CAF50' : '#F44336') + '20' }]}>
                <IconSymbol name="percent" size={24} color={percentage >= 50 ? '#4CAF50' : '#F44336'} />
              </View>
              <ThemedText type="title" style={[styles.score, { color: percentage >= 50 ? '#4CAF50' : '#F44336' }]}>
                {percentage.toFixed(1)}%
              </ThemedText>
              <ThemedText style={styles.scoreLabel}>Percentage</ThemedText>
            </View>
          </View>
        </ThemedView>

        <ThemedView style={[styles.answersCard, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: ThemeColors.orange + '20' }]}>
              <IconSymbol name="list.bullet.rectangle.fill" size={24} color={ThemeColors.orange} />
            </View>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Answer Details
            </ThemedText>
          </View>
          <View style={styles.answersGrid}>
            {result.answers.map((answer, index) => (
              <View
                key={index}
                style={[
                  styles.answerItem,
                  {
                    backgroundColor: answer.isCorrect ? '#4CAF5020' : '#F4433620',
                    borderColor: answer.isCorrect ? '#4CAF50' : '#F44336',
                  },
                ]}>
                <ThemedText style={styles.questionNumber}>Q{answer.questionNumber}</ThemedText>
                <ThemedText style={[styles.answerOption, { color: answer.isCorrect ? '#4CAF50' : '#F44336' }]}>
                  {answer.selectedOption}
                </ThemedText>
                <View style={[styles.answerStatusIcon, { backgroundColor: answer.isCorrect ? '#4CAF50' : '#F44336' }]}>
                  <IconSymbol 
                    name={answer.isCorrect ? 'checkmark' : 'xmark'} 
                    size={14} 
                    color={ThemeColors.white} 
                  />
                </View>
              </View>
            ))}
          </View>
        </ThemedView>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  summaryCard: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 20,
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
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  studentIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  detail: {
    fontSize: 14,
    opacity: 0.7,
    fontWeight: '500',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  scoreBox: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: ThemeColors.lightNeutral,
    minWidth: 100,
  },
  scoreBoxShadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  scoreIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  score: {
    fontSize: 32,
    fontWeight: '800',
    marginTop: 4,
  },
  scoreLabel: {
    fontSize: 12,
    marginTop: 6,
    opacity: 0.7,
    fontWeight: '600',
  },
  answersCard: {
    padding: 24,
    borderRadius: 20,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 20,
  },
  answersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  answerItem: {
    width: '18%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    position: 'relative',
  },
  questionNumber: {
    fontSize: 10,
    opacity: 0.7,
    fontWeight: '600',
    marginBottom: 4,
  },
  answerOption: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  answerStatusIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

