import { PremiumHeader } from '@/components/premium-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getExamResults } from '@/services/storage';
import { ExamResult } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { ListSkeleton } from '@/components/skeleton';
import { detectNetworkSpeed, getMinLoadingTime } from '@/utils/network';

export default function ReportsScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'month' | 'week'>('all');
  const [loading, setLoading] = useState(true);
  
  const fromExplore = params.from === 'explore';

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      let minLoadingTime = 300; // Default minimum loading time
      
      try {
        const networkSpeed = await detectNetworkSpeed();
        minLoadingTime = getMinLoadingTime(networkSpeed);
      } catch (networkError) {
        console.warn('Network speed detection failed, using default:', networkError);
      }
      
      const startTime = Date.now();
      const results = await getExamResults();
      const elapsedTime = Date.now() - startTime;
      
      // Ensure minimum loading time for better UX
      if (elapsedTime < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
      }
      
      setExamResults(results);
    } catch (error) {
      console.error('Failed to load reports:', error);
      setExamResults([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = examResults.filter(result => {
    const resultDate = new Date(result.completedAt);
    const now = new Date();
    if (selectedPeriod === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return resultDate >= weekAgo;
    }
    if (selectedPeriod === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return resultDate >= monthAgo;
    }
    return true;
  });

  const averageScore =
    filteredResults.length > 0
      ? filteredResults.reduce((sum, result) => sum + result.percentage, 0) / filteredResults.length
      : 0;

  const chartData = {
    labels: filteredResults.slice(-5).map((_, i) => `Exam ${i + 1}`),
    datasets: [
      {
        data: filteredResults.slice(-5).map(result => result.percentage),
        color: (opacity = 1) => ThemeColors.orange,
        strokeWidth: 2,
      },
    ],
  };

  const colors = Colors[colorScheme ?? 'light'];
  const screenWidth = Dimensions.get('window').width;

  return (
    <ThemedView style={styles.container}>
      <PremiumHeader 
        title="Student Reports" 
        showBackButton={true}
        onBackPress={fromExplore ? () => router.push('/explore') : undefined}
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        
        <ThemedView style={[styles.welcomeCard, { backgroundColor: colors.card }]}>
          <LinearGradient
            colors={[ThemeColors.deepBlue + '20', ThemeColors.orange + '20']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.welcomeGradient}>
            <View style={styles.welcomeContent}>
              <View style={[styles.welcomeIconContainer, { backgroundColor: ThemeColors.deepBlue + '30' }]}>
                <IconSymbol name="chart.bar.fill" size={40} color={ThemeColors.deepBlue} />
              </View>
              <ThemedText type="title" style={styles.welcomeTitle}>
                Student Reports
              </ThemedText>
              <ThemedText style={styles.welcomeDescription}>
                Track your performance and progress with detailed analytics and insights
              </ThemedText>
            </View>
          </LinearGradient>
        </ThemedView>

        <View style={styles.periodSelector}>
          {(['all', 'month', 'week'] as const).map(period => {
            const periodIcons = {
              all: 'calendar',
              month: 'calendar.badge.clock',
              week: 'calendar.badge.plus',
            };
            return (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  {
                    backgroundColor: selectedPeriod === period ? ThemeColors.orange : colors.card,
                    borderColor: selectedPeriod === period ? ThemeColors.orange : colors.border,
                  },
                ]}
                onPress={() => setSelectedPeriod(period)}
                activeOpacity={0.8}>
                <IconSymbol 
                  name={periodIcons[period] as any} 
                  size={18} 
                  color={selectedPeriod === period ? ThemeColors.white : colors.icon} 
                />
                <ThemedText
                  style={{
                    color: selectedPeriod === period ? ThemeColors.white : colors.text,
                    fontWeight: selectedPeriod === period ? '700' : '600',
                    marginLeft: 8,
                  }}>
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>

        <ThemedView style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Performance Summary
          </ThemedText>
          <View style={styles.summaryGrid}>
            <View style={[styles.summaryItem, styles.summaryItemShadow]}>
              <View style={[styles.summaryIconContainer, { backgroundColor: ThemeColors.orange + '20' }]}>
                <IconSymbol name="doc.text.fill" size={28} color={ThemeColors.orange} />
              </View>
              <ThemedText type="title" style={[styles.summaryValue, { color: ThemeColors.orange }]}>
                {filteredResults.length}
              </ThemedText>
              <ThemedText style={styles.summaryLabel}>Exams Taken</ThemedText>
            </View>
            <View style={[styles.summaryItem, styles.summaryItemShadow]}>
              <View style={[styles.summaryIconContainer, { backgroundColor: ThemeColors.deepBlue + '20' }]}>
                <IconSymbol name="chart.bar.fill" size={28} color={ThemeColors.deepBlue} />
              </View>
              <ThemedText type="title" style={[styles.summaryValue, { color: ThemeColors.deepBlue }]}>
                {averageScore.toFixed(1)}%
              </ThemedText>
              <ThemedText style={styles.summaryLabel}>Average Score</ThemedText>
            </View>
          </View>
        </ThemedView>

        {filteredResults.length > 0 && (
          <ThemedView style={[styles.chartCard, { backgroundColor: colors.card }]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Performance Trend
            </ThemedText>
            <LineChart
              data={chartData}
              width={screenWidth - 80}
              height={240}
              chartConfig={{
                backgroundColor: colors.card,
                backgroundGradientFrom: colors.card,
                backgroundGradientTo: colors.card,
                decimalPlaces: 1,
                color: (opacity = 1) => ThemeColors.orange,
                labelColor: (opacity = 1) => colors.text,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '8',
                  strokeWidth: '3',
                  stroke: ThemeColors.orange,
                },
              }}
              bezier
              style={styles.chart}
            />
          </ThemedView>
        )}

        <ThemedView style={[styles.resultsCard, { backgroundColor: colors.card }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Exam Results
          </ThemedText>
          {loading ? (
            <ListSkeleton count={3} itemHeight={120} />
          ) : filteredResults.length === 0 ? (
            <ThemedView style={styles.emptyContainer}>
              <IconSymbol name="chart.bar.fill" size={48} color={colors.icon} />
              <ThemedText style={styles.emptyText}>No results available</ThemedText>
              <ThemedText style={styles.emptySubtext}>
                Complete exams to see your performance reports
              </ThemedText>
            </ThemedView>
          ) : (
            filteredResults
              .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
              .map(result => (
                <ThemedView
                  key={result.examId}
                  style={[styles.resultItem, { backgroundColor: colors.card }]}>
                  <View style={styles.resultHeader}>
                    <ThemedText type="defaultSemiBold" numberOfLines={1} style={{ fontSize: 16, fontWeight: '700' }}>
                      {result.examTitle}
                    </ThemedText>
                    <View
                      style={[
                        styles.scoreBadge,
                        {
                          backgroundColor:
                            result.percentage >= 70
                              ? '#4CAF5020'
                              : result.percentage >= 50
                              ? ThemeColors.orange + '20'
                              : '#F4433620',
                        },
                      ]}>
                      <ThemedText
                        style={[
                          styles.scoreText,
                          {
                            color:
                              result.percentage >= 70
                                ? '#4CAF50'
                                : result.percentage >= 50
                                ? ThemeColors.orange
                                : '#F44336',
                          },
                        ]}>
                        {result.percentage.toFixed(1)}%
                      </ThemedText>
                    </View>
                  </View>
                  <View style={styles.resultDetails}>
                    <ThemedText style={styles.resultDetail}>
                      Score: {result.score}/{result.totalMarks}
                    </ThemedText>
                    <ThemedText style={styles.resultDetail}>
                      {new Date(result.completedAt).toLocaleDateString()}
                    </ThemedText>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${result.percentage}%`,
                          backgroundColor:
                            result.percentage >= 70
                              ? '#4CAF50'
                              : result.percentage >= 50
                              ? ThemeColors.orange
                              : '#F44336',
                        },
                      ]}
                    />
                  </View>
                </ThemedView>
              ))
          )}
        </ThemedView>
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
    paddingBottom: 100,
  },
  welcomeCard: {
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
  welcomeGradient: {
    padding: 28,
  },
  welcomeContent: {
    alignItems: 'center',
  },
  welcomeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeDescription: {
    fontSize: 15,
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 20,
  },
  periodButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
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
  sectionTitle: {
    marginBottom: 20,
    fontWeight: '700',
    fontSize: 20,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 20,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    backgroundColor: ThemeColors.lightNeutral,
  },
  summaryItemShadow: {
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
  summaryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryValue: {
    fontSize: 36,
    fontWeight: '800',
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 13,
    marginTop: 6,
    opacity: 0.7,
    fontWeight: '500',
  },
  chartCard: {
    padding: 20,
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
  chart: {
    marginVertical: 12,
    borderRadius: 16,
  },
  resultsCard: {
    padding: 20,
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
  resultItem: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
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
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  resultDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  resultDetail: {
    fontSize: 14,
    opacity: 0.7,
    fontWeight: '500',
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: ThemeColors.lightNeutral,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 15,
    marginTop: 8,
    opacity: 0.7,
    textAlign: 'center',
    fontWeight: '500',
  },
});

