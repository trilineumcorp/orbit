import { PremiumHeader } from '@/components/premium-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getExamResults } from '@/services/storage';
import { examResultService } from '@/services/exam-results';
import { ExamResult } from '@/types';
import { detectNetworkSpeed, getMinLoadingTime } from '@/utils/network';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

type ReportExamResult = ExamResult & {
  correctAnswers?: number;
  totalQuestions?: number;
  timeSpent?: number;
};

export default function ReportsScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const params = useLocalSearchParams();

  const [examResults, setExamResults] = useState<ReportExamResult[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'month' | 'week'>('all');
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'score' | 'time' | 'accuracy'>('score');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const metricCardAnims = useRef<Animated.Value[]>([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const fromExplore = params.from === 'explore';
  const screenWidth = Dimensions.get('window').width;
  const themeColors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
      ]).start();

      metricCardAnims.forEach((anim, index) => {
        anim.setValue(0);
        Animated.spring(anim, {
          toValue: 1,
          delay: 100 + index * 50,
          friction: 7,
          tension: 50,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [loading, fadeAnim, scaleAnim, slideAnim, metricCardAnims]);

  const loadReports = async () => {
    try {
      setLoading(true);

      let minLoadingTime = 300;

      try {
        const networkSpeed = await detectNetworkSpeed();
        minLoadingTime = getMinLoadingTime(networkSpeed);
      } catch (networkError) {
        console.warn('Network speed detection failed, using default:', networkError);
      }

      const startTime = Date.now();
      const [localResults, remoteResults] = await Promise.all([
        getExamResults() as Promise<ReportExamResult[]>,
        examResultService.getAllResults().catch(() => [] as ReportExamResult[]),
      ]);
      const merged = new Map<string, ReportExamResult>();
      const add = (r: ReportExamResult) => {
        const key = `${r.examId}_${new Date(r.completedAt).getTime()}`;
        const prev = merged.get(key);
        if (!prev || new Date(r.completedAt) >= new Date(prev.completedAt)) {
          merged.set(key, r);
        }
      };
      localResults.forEach(add);
      remoteResults.forEach(add);
      const results = Array.from(merged.values()).sort(
        (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      );
      const elapsedTime = Date.now() - startTime;

      if (elapsedTime < minLoadingTime) {
        await new Promise((resolve) => setTimeout(resolve, minLoadingTime - elapsedTime));
      }

      setExamResults(results);
    } catch (error) {
      console.error('Failed to load reports:', error);
      setExamResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (period: 'all' | 'month' | 'week') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPeriod(period);
  };

  const handleMetricChange = (metric: 'score' | 'time' | 'accuracy') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMetric(metric);
  };

  const filteredResults = useMemo(() => {
    return examResults.filter((result) => {
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
  }, [examResults, selectedPeriod]);

  const totalExams = filteredResults.length;

  const averageScore =
    totalExams > 0
      ? filteredResults.reduce((sum, r) => sum + r.percentage, 0) / totalExams
      : 0;

  const highestScore =
    totalExams > 0 ? Math.max(...filteredResults.map((r) => r.percentage)) : 0;

  const lowestScore =
    totalExams > 0 ? Math.min(...filteredResults.map((r) => r.percentage)) : 0;

  const totalTimeSpent = filteredResults.reduce((sum, r) => sum + (r.timeSpent ?? 0), 0);

  const averageAccuracy =
    totalExams > 0
      ? filteredResults.reduce((sum, r) => {
          const totalQuestions = r.totalQuestions ?? 0;
          const correctAnswers = r.correctAnswers ?? 0;
          const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
          return sum + accuracy;
        }, 0) / totalExams
      : 0;

  const recentResults = filteredResults.slice(-3);
  const previousResults = filteredResults.slice(-6, -3);

  const recentAvg =
    recentResults.reduce((sum, r) => sum + r.percentage, 0) / (recentResults.length || 1);

  const previousAvg =
    previousResults.reduce((sum, r) => sum + r.percentage, 0) / (previousResults.length || 1);

  const trend = recentAvg - previousAvg;
  const trendIcon =
    trend > 0 ? 'arrow.up.right' : trend < 0 ? 'arrow.down.right' : 'arrow.right';

  const MetricCard = ({
    icon,
    value,
    label,
    change,
    color,
    index,
  }: {
    icon: any;
    value: string;
    label: string;
    change?: number;
    color: string;
    index: number;
  }) => (
    <Animated.View
      style={[
        styles.metricCard,
        {
          backgroundColor: themeColors.card,
          transform: [{ scale: metricCardAnims[index] }],
          opacity: metricCardAnims[index],
        },
      ]}>
      <LinearGradient
        colors={[`${color}10`, 'transparent']}
        style={styles.metricGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={styles.metricHeader}>
        <View style={[styles.metricIconContainer, { backgroundColor: `${color}15` }]}>
          <IconSymbol name={icon} size={22} color={color} />
        </View>

        {change !== undefined && (
          <View
            style={[
              styles.metricChange,
              {
                backgroundColor: change >= 0 ? '#4CAF5015' : '#F4433615',
              },
            ]}>
            <IconSymbol
              name={change >= 0 ? 'arrow.up' : 'arrow.down'}
              size={12}
              color={change >= 0 ? '#4CAF50' : '#F44336'}
            />
            <ThemedText
              style={[
                styles.metricChangeText,
                { color: change >= 0 ? '#4CAF50' : '#F44336' },
              ]}>
              {Math.abs(change).toFixed(1)}%
            </ThemedText>
          </View>
        )}
      </View>

      <Animated.Text style={[styles.metricValue, { color: themeColors.text }]}>
        {value}
      </Animated.Text>

      <ThemedText style={styles.metricLabel}>{label}</ThemedText>
    </Animated.View>
  );

  const InsightBadge = ({
    type,
    text,
  }: {
    type: 'success' | 'warning' | 'info';
    text: string;
  }) => {
    const badgeColors = {
      success: {
        bg: '#4CAF5015',
        text: '#4CAF50',
        icon: 'checkmark.circle.fill',
        gradient: ['#4CAF50', '#45a049'] as [string, string],
      },
      warning: {
        bg: '#FFA00015',
        text: '#FFA000',
        icon: 'exclamationmark.triangle.fill',
        gradient: ['#FFA000', '#FF8C00'] as [string, string],
      },
      info: {
        bg: '#2196F315',
        text: '#2196F3',
        icon: 'info.circle.fill',
        gradient: ['#2196F3', '#1976D2'] as [string, string],
      },
    };

    return (
      <View style={[styles.insightBadge, { backgroundColor: badgeColors[type].bg }]}>
        <LinearGradient
          colors={badgeColors[type].gradient}
          style={styles.insightGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <IconSymbol name={badgeColors[type].icon as any} size={14} color={badgeColors[type].text} />
        <ThemedText style={[styles.insightText, { color: badgeColors[type].text }]}>
          {text}
        </ThemedText>
      </View>
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <PremiumHeader
          title="Analytics"
          showBackButton={true}
          onBackPress={fromExplore ? () => router.push('/explore') : undefined}
        />
        <View style={styles.loadingContainer}>
          <View style={styles.loadingSpinner}>
            <LinearGradient
              colors={[ThemeColors.orange, ThemeColors.deepBlue]}
              style={styles.loadingGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </View>
          <ThemedText style={styles.loadingText}>Loading your analytics...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <PremiumHeader
        title="Analytics"
        showBackButton={true}
        onBackPress={fromExplore ? () => router.push('/explore') : undefined}
      />

      <Animated.ScrollView
        style={[styles.content, { opacity: fadeAnim }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}>
        <Animated.View
          style={[
            styles.headerSection,
            {
              transform: [{ translateY: slideAnim }],
              opacity: fadeAnim,
            },
          ]}>
          <View>
            <ThemedText style={styles.greeting}>✨ Your Performance</ThemedText>
            <ThemedText style={styles.title}>Learning Analytics</ThemedText>
          </View>

          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
            <LinearGradient
              colors={[ThemeColors.orange, ThemeColors.deepBlue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.profileGradient}>
              <IconSymbol name="person.fill" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[
            styles.periodContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}>
          {(['week', 'month', 'all'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodChip,
                selectedPeriod === period && styles.periodChipActive,
                {
                  backgroundColor:
                    selectedPeriod === period ? ThemeColors.orange : themeColors.card,
                },
              ]}
              onPress={() => handlePeriodChange(period)}
              activeOpacity={0.8}>
              <ThemedText
                style={[
                  styles.periodChipText,
                  { color: selectedPeriod === period ? '#FFFFFF' : themeColors.text },
                ]}>
                {period === 'all'
                  ? 'All Time'
                  : period.charAt(0).toUpperCase() + period.slice(1)}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </Animated.View>

        <Animated.View style={[{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient
            colors={['#667EEA', '#764BA2', '#5A67D8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.mainStatsCard}>
            <View style={styles.mainStatsHeader}>
              <ThemedText style={styles.mainStatsTitle}>Overall Performance</ThemedText>

              <View style={styles.trendContainer}>
                <IconSymbol name={trendIcon as any} size={16} color="#FFFFFF" />
                <ThemedText style={styles.trendText}>
                  {trend > 0 ? '+' : ''}
                  {trend.toFixed(1)}% vs last period
                </ThemedText>
              </View>
            </View>

            <View style={styles.mainStatsGrid}>
              <View style={styles.mainStatItem}>
                <ThemedText style={styles.mainStatValue}>{totalExams}</ThemedText>
                <ThemedText style={styles.mainStatLabel}>Exams</ThemedText>
              </View>

              <View style={styles.mainStatDivider} />

              <View style={styles.mainStatItem}>
                <ThemedText style={styles.mainStatValue}>
                  {averageScore.toFixed(1)}%
                </ThemedText>
                <ThemedText style={styles.mainStatLabel}>Avg. Score</ThemedText>
              </View>

              <View style={styles.mainStatDivider} />

              <View style={styles.mainStatItem}>
                <ThemedText style={styles.mainStatValue}>
                  {Math.floor(totalTimeSpent / 60)}h
                </ThemedText>
                <ThemedText style={styles.mainStatLabel}>Total Time</ThemedText>
              </View>
            </View>

            <View style={styles.achievementRow}>
              {highestScore >= 90 && <InsightBadge type="success" text="🏆 Top Performer" />}
              {averageScore >= 75 && <InsightBadge type="info" text="📈 Above Average" />}
              {filteredResults.length >= 10 && <InsightBadge type="warning" text="⭐ Consistent" />}
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={[styles.metricTabs, { opacity: fadeAnim }]}>
          {(['score', 'time', 'accuracy'] as const).map((metric) => (
            <TouchableOpacity
              key={metric}
              style={[
                styles.metricTab,
                selectedMetric === metric && styles.metricTabActive,
                {
                  borderBottomColor:
                    selectedMetric === metric ? ThemeColors.orange : 'transparent',
                },
              ]}
              onPress={() => handleMetricChange(metric)}>
              <ThemedText
                style={[
                  styles.metricTabText,
                  {
                    color:
                      selectedMetric === metric ? ThemeColors.orange : themeColors.text,
                  },
                ]}>
                {metric === 'score'
                  ? '📊 Score'
                  : metric === 'time'
                  ? '⏱️ Time'
                  : '🎯 Accuracy'}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </Animated.View>

        <View style={styles.metricsGrid}>
          <MetricCard
            icon="chart.bar.fill"
            value={
              selectedMetric === 'score'
                ? `${averageScore.toFixed(1)}%`
                : selectedMetric === 'time'
                ? `${Math.floor(totalTimeSpent / 60)}h ${totalTimeSpent % 60}m`
                : `${averageAccuracy.toFixed(1)}%`
            }
            label={
              selectedMetric === 'score'
                ? 'Average Score'
                : selectedMetric === 'time'
                ? 'Total Time'
                : 'Average Accuracy'
            }
            change={trend}
            color={ThemeColors.orange}
            index={0}
          />

          <MetricCard
            icon="star.fill"
            value={`${highestScore.toFixed(1)}%`}
            label="Highest Score"
            color="#4CAF50"
            index={1}
          />

          <MetricCard
            icon="arrow.up.and.down"
            value={`${lowestScore.toFixed(1)}%`}
            label="Lowest Score"
            color="#F44336"
            index={2}
          />

          <MetricCard
            icon="clock.fill"
            value={`${Math.floor(totalTimeSpent / 60)}h ${totalTimeSpent % 60}m`}
            label="Total Time"
            color="#764BA2"
            index={3}
          />
        </View>

        {filteredResults.length > 1 && (
          <Animated.View
            style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <ThemedView style={[styles.chartCard, { backgroundColor: themeColors.card }]}>
              <View style={styles.chartHeader}>
                <View>
                  <ThemedText style={styles.chartTitle}>📈 Performance Trend</ThemedText>
                  <ThemedText style={styles.chartSubtitle}>
                    Last {Math.min(7, filteredResults.length)} exams
                  </ThemedText>
                </View>

                <View style={styles.chartLegend}>
                  <View
                    style={[styles.legendDot, { backgroundColor: ThemeColors.orange }]}
                  />
                  <ThemedText style={styles.legendText}>Score %</ThemedText>
                </View>
              </View>

              <LineChart
                data={{
                  labels: filteredResults.slice(-7).map((_, i) => `Exam ${i + 1}`),
                  datasets: [
                    {
                      data: filteredResults.slice(-7).map((r) => r.percentage),
                      color: () => ThemeColors.orange,
                      strokeWidth: 3,
                    },
                  ],
                }}
                width={screenWidth - 64}
                height={220}
                chartConfig={{
                  backgroundColor: 'transparent',
                  backgroundGradientFrom: 'transparent',
                  backgroundGradientTo: 'transparent',
                  decimalPlaces: 0,
                  color: () => ThemeColors.orange,
                  labelColor: () => `${themeColors.text}80`,
                  propsForDots: {
                    r: '6',
                    strokeWidth: '2',
                    stroke: '#FFFFFF',
                  },
                  propsForBackgroundLines: {
                    stroke: `${themeColors.border}30`,
                    strokeDasharray: '',
                  },
                }}
                bezier
                style={styles.chart}
                withInnerLines={true}
                withOuterLines={false}
                withVerticalLines={false}
                withHorizontalLabels={true}
                fromZero={true}
                segments={4}
                formatYLabel={(value) => `${value}%`}
              />
            </ThemedView>
          </Animated.View>
        )}

        <Animated.View
          style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <ThemedView style={[styles.historyCard, { backgroundColor: themeColors.card }]}>
            <View style={styles.historyHeader}>
              <View>
                <ThemedText style={styles.historyTitle}>📚 Exam History</ThemedText>
                <ThemedText style={styles.historySubtitle}>
                  {filteredResults.length} completed • Last updated today
                </ThemedText>
              </View>

              <TouchableOpacity
                style={styles.sortButton}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                <IconSymbol name="arrow.up.arrow.down" size={18} color={themeColors.icon} />
              </TouchableOpacity>
            </View>

            {filteredResults.length === 0 ? (
              <View style={styles.emptyState}>
                <View
                  style={[
                    styles.emptyIcon,
                    { backgroundColor: `${themeColors.border}20` },
                  ]}>
                  <IconSymbol
                    name="doc.text.magnifyingglass"
                    size={48}
                    color={themeColors.icon}
                  />
                </View>

                <ThemedText style={styles.emptyTitle}>No data yet</ThemedText>

                <ThemedText style={styles.emptyDescription}>
                  Complete your first exam to see analytics
                </ThemedText>

                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => router.push('/explore')}
                  activeOpacity={0.8}>
                  <LinearGradient
                    colors={[ThemeColors.orange, ThemeColors.deepBlue]}
                    style={styles.emptyButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}>
                    <ThemedText style={styles.emptyButtonText}>
                      Start Learning →
                    </ThemedText>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              filteredResults
                .slice()
                .sort(
                  (a, b) =>
                    new Date(b.completedAt).getTime() -
                    new Date(a.completedAt).getTime()
                )
                .map((result: ReportExamResult, index: number) => {
                  const scoreColor =
                    result.percentage >= 80
                      ? '#4CAF50'
                      : result.percentage >= 60
                      ? '#2196F3'
                      : result.percentage >= 40
                      ? '#FFA000'
                      : '#F44336';

                  const correctAnswers = result.correctAnswers ?? 0;
                  const totalQuestions = result.totalQuestions ?? 0;
                  const timeSpent = result.timeSpent ?? 0;

                  return (
                    <Animated.View
                      key={`${result.examId}-${index}`}
                      style={[
                        styles.historyItemWrapper,
                        {
                          opacity: fadeAnim,
                          transform: [{ translateX: slideAnim }],
                        },
                      ]}>
                      <TouchableOpacity
                        style={[styles.historyItem, { borderLeftColor: scoreColor }]}
                        activeOpacity={0.7}
                        onPress={() =>
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                        }>
                        <View style={styles.historyItemHeader}>
                          <View style={styles.historyItemLeft}>
                            <View
                              style={[
                                styles.historyItemIcon,
                                { backgroundColor: `${scoreColor}15` },
                              ]}>
                              <IconSymbol
                                name="doc.text.fill"
                                size={20}
                                color={scoreColor}
                              />
                            </View>

                            <View style={styles.historyItemInfo}>
                              <ThemedText
                                style={styles.historyItemTitle}
                                numberOfLines={1}>
                                {result.examTitle}
                              </ThemedText>

                              <ThemedText style={styles.historyItemDate}>
                                {new Date(result.completedAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </ThemedText>
                            </View>
                          </View>

                          <View
                            style={[
                              styles.historyItemScore,
                              { backgroundColor: `${scoreColor}15` },
                            ]}>
                            <ThemedText
                              style={[
                                styles.historyItemScoreText,
                                { color: scoreColor },
                              ]}>
                              {result.percentage.toFixed(0)}%
                            </ThemedText>
                          </View>
                        </View>

                        <View style={styles.historyItemDetails}>
                          <View style={styles.historyDetail}>
                            <IconSymbol
                              name="checkmark.circle"
                              size={14}
                              color={themeColors.icon}
                            />
                            <ThemedText style={styles.historyDetailText}>
                              {correctAnswers}/{totalQuestions} correct
                            </ThemedText>
                          </View>

                          <View style={styles.historyDetail}>
                            <IconSymbol name="clock" size={14} color={themeColors.icon} />
                            <ThemedText style={styles.historyDetailText}>
                              {Math.floor(timeSpent / 60)} min {timeSpent % 60} sec
                            </ThemedText>
                          </View>
                        </View>

                        <View style={styles.progressBar}>
                          <View
                            style={[
                              styles.progressFill,
                              {
                                width: `${result.percentage}%`,
                                backgroundColor: scoreColor,
                              },
                            ]}
                          />
                        </View>
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })
            )}
          </ThemedView>
        </Animated.View>
      </Animated.ScrollView>
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
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 4,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  profileButton: {
    width: 52,
    height: 52,
    borderRadius: 18,
    overflow: 'hidden',
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
  profileGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  periodChip: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 32,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  periodChipActive: {
    ...Platform.select({
      ios: {
        shadowColor: ThemeColors.orange,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  periodChipText: {
    fontSize: 15,
    fontWeight: '600',
  },
  mainStatsCard: {
    borderRadius: 28,
    padding: 24,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#764BA2',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  mainStatsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  mainStatsTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
    letterSpacing: 0.5,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 24,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  mainStatsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  mainStatItem: {
    alignItems: 'center',
  },
  mainStatValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  mainStatLabel: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.85,
    fontWeight: '500',
  },
  mainStatDivider: {
    width: 1,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  achievementRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  insightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  insightGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  insightText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricTabs: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 24,
  },
  metricTab: {
    paddingBottom: 10,
    borderBottomWidth: 2,
  },
  metricTabActive: {
    borderBottomWidth: 2,
  },
  metricTabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    padding: 18,
    borderRadius: 24,
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  metricGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  metricIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
  },
  metricChangeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  metricValue: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 13,
    opacity: 0.6,
    fontWeight: '500',
  },
  chartCard: {
    padding: 20,
    borderRadius: 28,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 13,
    opacity: 0.6,
    fontWeight: '500',
  },
  chartLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    opacity: 0.6,
    fontWeight: '500',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 20,
  },
  historyCard: {
    padding: 20,
    borderRadius: 28,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  historySubtitle: {
    fontSize: 13,
    opacity: 0.6,
    fontWeight: '500',
  },
  sortButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: ThemeColors.lightNeutral,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyItemWrapper: {
    marginBottom: 12,
  },
  historyItem: {
    padding: 16,
    borderRadius: 20,
    borderLeftWidth: 4,
    backgroundColor: ThemeColors.lightNeutral,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyItemInfo: {
    flex: 1,
  },
  historyItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  historyItemDate: {
    fontSize: 12,
    opacity: 0.5,
    fontWeight: '500',
  },
  historyItemScore: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    marginLeft: 10,
  },
  historyItemScoreText: {
    fontSize: 16,
    fontWeight: '700',
  },
  historyItemDetails: {
    flexDirection: 'row',
    gap: 18,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  historyDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyDetailText: {
    fontSize: 12,
    opacity: 0.7,
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: ThemeColors.lightNeutral,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
    marginBottom: 28,
    fontWeight: '500',
    paddingHorizontal: 32,
  },
  emptyButton: {
    overflow: 'hidden',
    borderRadius: 32,
    ...Platform.select({
      ios: {
        shadowColor: ThemeColors.orange,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  emptyButtonGradient: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 32,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingSpinner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 20,
    overflow: 'hidden',
  },
  loadingGradient: {
    flex: 1,
    borderRadius: 30,
  },
  loadingText: {
    fontSize: 14,
    opacity: 0.6,
    fontWeight: '500',
  },
});