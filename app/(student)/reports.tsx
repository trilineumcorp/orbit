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
import { Dimensions, Platform, ScrollView, StyleSheet, TouchableOpacity, View, Animated } from 'react-native';
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
  const [selectedMetric, setSelectedMetric] = useState<'score' | 'time' | 'accuracy'>('score');
  
  const fromExplore = params.from === 'explore';

  useEffect(() => {
    loadReports();
  }, []);

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
      const results = await getExamResults();
      const elapsedTime = Date.now() - startTime;
      
      if (elapsedTime < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
      }
      
      setExamResults(results);
    } catch (error) {
      console.error('Failed to load reports:', error);
      setExamResults([]);
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

  // Calculate comprehensive stats
  const totalExams = filteredResults.length;
  const averageScore = totalExams > 0
    ? filteredResults.reduce((sum, r) => sum + r.percentage, 0) / totalExams
    : 0;
  const highestScore = totalExams > 0
    ? Math.max(...filteredResults.map(r => r.percentage))
    : 0;
  const lowestScore = totalExams > 0
    ? Math.min(...filteredResults.map(r => r.percentage))
    : 0;
  const totalTimeSpent = filteredResults.reduce((sum, r) => sum + (r.timeSpent || 0), 0);
  const averageAccuracy = totalExams > 0
    ? filteredResults.reduce((sum, r) => sum + ((r.correctAnswers / r.totalQuestions) * 100), 0) / totalExams
    : 0;

  // Calculate trend (comparing last 3 exams with previous ones)
  const recentResults = filteredResults.slice(-3);
  const previousResults = filteredResults.slice(-6, -3);
  const recentAvg = recentResults.reduce((sum, r) => sum + r.percentage, 0) / (recentResults.length || 1);
  const previousAvg = previousResults.reduce((sum, r) => sum + r.percentage, 0) / (previousResults.length || 1);
  const trend = recentAvg - previousAvg;
  const trendIcon = trend > 0 ? 'arrow.up.right' : trend < 0 ? 'arrow.down.right' : 'arrow.right';
  const trendColor = trend > 0 ? '#4CAF50' : trend < 0 ? '#F44336' : '#FFA000';

  const colors = Colors[colorScheme ?? 'light'];
  const screenWidth = Dimensions.get('window').width;

  const MetricCard = ({ icon, value, label, change, color }: any) => (
    <ThemedView style={[styles.metricCard, { backgroundColor: colors.card }]}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIconContainer, { backgroundColor: color + '15' }]}>
          <IconSymbol name={icon} size={20} color={color} />
        </View>
        {change !== undefined && (
          <View style={[styles.metricChange, { backgroundColor: change >= 0 ? '#4CAF5015' : '#F4433615' }]}>
            <IconSymbol 
              name={change >= 0 ? 'arrow.up' : 'arrow.down'} 
              size={12} 
              color={change >= 0 ? '#4CAF50' : '#F44336'} 
            />
            <ThemedText style={[styles.metricChangeText, { color: change >= 0 ? '#4CAF50' : '#F44336' }]}>
              {Math.abs(change)}%
            </ThemedText>
          </View>
        )}
      </View>
      <ThemedText style={styles.metricValue}>{value}</ThemedText>
      <ThemedText style={styles.metricLabel}>{label}</ThemedText>
    </ThemedView>
  );

  const InsightBadge = ({ type, text }: { type: 'success' | 'warning' | 'info'; text: string }) => {
    const colors = {
      success: { bg: '#4CAF5015', text: '#4CAF50', icon: 'checkmark.circle.fill' },
      warning: { bg: '#FFA00015', text: '#FFA000', icon: 'exclamationmark.triangle.fill' },
      info: { bg: '#2196F315', text: '#2196F3', icon: 'info.circle.fill' }
    };
    return (
      <View style={[styles.insightBadge, { backgroundColor: colors[type].bg }]}>
        <IconSymbol name={colors[type].icon as any} size={14} color={colors[type].text} />
        <ThemedText style={[styles.insightText, { color: colors[type].text }]}>{text}</ThemedText>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <PremiumHeader 
        title="Analytics" 
        showBackButton={true}
        onBackPress={fromExplore ? () => router.push('/explore') : undefined}
      />

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View>
            <ThemedText style={styles.greeting}>Your Performance</ThemedText>
            <ThemedText style={styles.title}>Learning Analytics</ThemedText>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <LinearGradient
              colors={[ThemeColors.orange, ThemeColors.deepBlue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.profileGradient}>
              <IconSymbol name="person.fill" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Period Selector */}
        <View style={styles.periodContainer}>
          {(['week', 'month', 'all'] as const).map(period => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodChip,
                selectedPeriod === period && styles.periodChipActive,
                { backgroundColor: selectedPeriod === period ? ThemeColors.orange : colors.card }
              ]}
              onPress={() => setSelectedPeriod(period)}>
              <ThemedText style={[
                styles.periodChipText,
                { color: selectedPeriod === period ? '#FFFFFF' : colors.text }
              ]}>
                {period === 'all' ? 'All Time' : period.charAt(0).toUpperCase() + period.slice(1)}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Main Stats Card */}
        <LinearGradient
          colors={['#667EEA', '#764BA2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.mainStatsCard}>
          <View style={styles.mainStatsHeader}>
            <ThemedText style={styles.mainStatsTitle}>Overall Performance</ThemedText>
            <View style={styles.trendContainer}>
              <IconSymbol name={trendIcon as any} size={16} color="#FFFFFF" />
              <ThemedText style={styles.trendText}>
                {trend > 0 ? '+' : ''}{trend.toFixed(1)}% vs last period
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
              <ThemedText style={styles.mainStatValue}>{averageScore.toFixed(1)}%</ThemedText>
              <ThemedText style={styles.mainStatLabel}>Avg. Score</ThemedText>
            </View>
            <View style={styles.mainStatDivider} />
            <View style={styles.mainStatItem}>
              <ThemedText style={styles.mainStatValue}>{Math.floor(totalTimeSpent / 60)}h</ThemedText>
              <ThemedText style={styles.mainStatLabel}>Total Time</ThemedText>
            </View>
          </View>

          {/* Achievement Badges */}
          <View style={styles.achievementRow}>
            {highestScore >= 90 && (
              <InsightBadge type="success" text="Top Performer" />
            )}
            {averageScore >= 75 && (
              <InsightBadge type="info" text="Above Average" />
            )}
            {filteredResults.length >= 10 && (
              <InsightBadge type="warning" text="Consistent" />
            )}
          </View>
        </LinearGradient>

        {/* Metric Tabs */}
        <View style={styles.metricTabs}>
          {['score', 'time', 'accuracy'].map(metric => (
            <TouchableOpacity
              key={metric}
              style={[
                styles.metricTab,
                selectedMetric === metric && styles.metricTabActive,
                { borderBottomColor: selectedMetric === metric ? ThemeColors.orange : 'transparent' }
              ]}
              onPress={() => setSelectedMetric(metric as any)}>
              <ThemedText style={[
                styles.metricTabText,
                { color: selectedMetric === metric ? ThemeColors.orange : colors.text }
              ]}>
                {metric.charAt(0).toUpperCase() + metric.slice(1)}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <MetricCard
            icon="chart.bar.fill"
            value={`${averageScore.toFixed(1)}%`}
            label="Average Score"
            change={trend}
            color={ThemeColors.orange}
          />
          <MetricCard
            icon="star.fill"
            value={`${highestScore.toFixed(1)}%`}
            label="Highest Score"
            color="#4CAF50"
          />
          <MetricCard
            icon="arrow.up.and.down"
            value={`${lowestScore.toFixed(1)}%`}
            label="Lowest Score"
            color="#F44336"
          />
          <MetricCard
            icon="clock.fill"
            value={Math.floor(totalTimeSpent / 60) + 'h'}
            label="Total Time"
            color="#764BA2"
          />
        </View>

        {/* Chart Section */}
        {filteredResults.length > 1 && (
          <ThemedView style={[styles.chartCard, { backgroundColor: colors.card }]}>
            <View style={styles.chartHeader}>
              <View>
                <ThemedText style={styles.chartTitle}>Performance Trend</ThemedText>
                <ThemedText style={styles.chartSubtitle}>Last {Math.min(7, filteredResults.length)} exams</ThemedText>
              </View>
              <View style={styles.chartLegend}>
                <View style={[styles.legendDot, { backgroundColor: ThemeColors.orange }]} />
                <ThemedText style={styles.legendText}>Score %</ThemedText>
              </View>
            </View>
            
            <LineChart
              data={{
                labels: filteredResults.slice(-7).map((_, i) => `E${i + 1}`),
                datasets: [{
                  data: filteredResults.slice(-7).map(r => r.percentage),
                  color: () => ThemeColors.orange,
                  strokeWidth: 3,
                }]
              }}
              width={screenWidth - 64}
              height={200}
              chartConfig={{
                backgroundColor: 'transparent',
                backgroundGradientFrom: 'transparent',
                backgroundGradientTo: 'transparent',
                decimalPlaces: 0,
                color: () => ThemeColors.orange,
                labelColor: () => colors.text + '80',
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: ThemeColors.white,
                },
                propsForBackgroundLines: {
                  stroke: colors.border + '30',
                  strokeDasharray: '',
                }
              }}
              bezier
              style={styles.chart}
              withInnerLines={true}
              withOuterLines={false}
              withVerticalLines={false}
              withHorizontalLabels={true}
              fromZero={true}
              segments={4}
            />
          </ThemedView>
        )}

        {/* Exam History */}
        <ThemedView style={[styles.historyCard, { backgroundColor: colors.card }]}>
          <View style={styles.historyHeader}>
            <View>
              <ThemedText style={styles.historyTitle}>Exam History</ThemedText>
              <ThemedText style={styles.historySubtitle}>
                {filteredResults.length} completed • Last updated today
              </ThemedText>
            </View>
            <TouchableOpacity style={styles.sortButton}>
              <IconSymbol name="arrow.up.arrow.down" size={18} color={colors.icon} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ListSkeleton count={3} itemHeight={120} />
          ) : filteredResults.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.border + '20' }]}>
                <IconSymbol name="doc.text.magnifyingglass" size={48} color={colors.icon} />
              </View>
              <ThemedText style={styles.emptyTitle}>No data yet</ThemedText>
              <ThemedText style={styles.emptyDescription}>
                Complete your first exam to see analytics
              </ThemedText>
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={() => router.push('/explore')}>
                <ThemedText style={styles.emptyButtonText}>Start Learning</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            filteredResults
              .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
              .map((result, index) => {
                const scoreColor = result.percentage >= 80 ? '#4CAF50' : 
                                  result.percentage >= 60 ? '#2196F3' :
                                  result.percentage >= 40 ? '#FFA000' : '#F44336';
                
                return (
                  <TouchableOpacity
                    key={result.examId}
                    style={[styles.historyItem, { borderLeftColor: scoreColor }]}
                    activeOpacity={0.7}>
                    
                    <View style={styles.historyItemHeader}>
                      <View style={styles.historyItemLeft}>
                        <View style={[styles.historyItemIcon, { backgroundColor: scoreColor + '15' }]}>
                          <IconSymbol name="doc.text.fill" size={20} color={scoreColor} />
                        </View>
                        <View style={styles.historyItemInfo}>
                          <ThemedText style={styles.historyItemTitle} numberOfLines={1}>
                            {result.examTitle}
                          </ThemedText>
                          <ThemedText style={styles.historyItemDate}>
                            {new Date(result.completedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </ThemedText>
                        </View>
                      </View>
                      <View style={[styles.historyItemScore, { backgroundColor: scoreColor + '15' }]}>
                        <ThemedText style={[styles.historyItemScoreText, { color: scoreColor }]}>
                          {result.percentage.toFixed(0)}%
                        </ThemedText>
                      </View>
                    </View>

                    <View style={styles.historyItemDetails}>
                      <View style={styles.historyDetail}>
                        <IconSymbol name="checkmark.circle" size={14} color={colors.icon} />
                        <ThemedText style={styles.historyDetailText}>
                          {result.correctAnswers}/{result.totalQuestions} correct
                        </ThemedText>
                      </View>
                      <View style={styles.historyDetail}>
                        <IconSymbol name="clock" size={14} color={colors.icon} />
                        <ThemedText style={styles.historyDetailText}>
                          {Math.floor(result.timeSpent / 60)} min
                        </ThemedText>
                      </View>
                    </View>

                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${result.percentage}%`, backgroundColor: scoreColor }
                        ]} 
                      />
                    </View>
                  </TouchableOpacity>
                );
              })
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
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
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
    gap: 10,
    marginBottom: 24,
  },
  periodChip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 30,
    alignItems: 'center',
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
  periodChipActive: {
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
  periodChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  mainStatsCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#764BA2',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  mainStatsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  mainStatsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
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
    marginBottom: 16,
  },
  mainStatItem: {
    alignItems: 'center',
  },
  mainStatValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  mainStatLabel: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.8,
    fontWeight: '500',
  },
  mainStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  achievementRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  insightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  insightText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricTabs: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 20,
  },
  metricTab: {
    paddingBottom: 8,
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
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
  },
  metricChangeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 13,
    opacity: 0.6,
    fontWeight: '500',
  },
  chartCard: {
    padding: 16,
    borderRadius: 24,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    opacity: 0.6,
    fontWeight: '500',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  historyCard: {
    padding: 16,
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: ThemeColors.lightNeutral,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyItem: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    backgroundColor: ThemeColors.lightNeutral,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
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
    width: 40,
    height: 40,
    borderRadius: 12,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 10,
  },
  historyItemScoreText: {
    fontSize: 15,
    fontWeight: '700',
  },
  historyItemDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
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
    width: 100,
    height: 100,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  emptyButton: {
    backgroundColor: ThemeColors.orange,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
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
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});