import { PremiumHeader } from '@/components/premium-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getExams, Exam } from '@/services/content';
import { ExamSkeleton } from '@/components/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { detectNetworkSpeed, getMinLoadingTime } from '@/utils/network';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology'] as const;
const EXAM_TYPES = ['All'] as const;
const SORT_OPTIONS = ['Newest', 'Duration', 'Questions'] as const;

type ExamType = (typeof EXAM_TYPES)[number];
type SortOption = (typeof SORT_OPTIONS)[number];

export default function ExamsScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();

  const [exams, setExams] = useState<Exam[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedExamType, setSelectedExamType] = useState<ExamType>('All');
  const [activeFilter, setActiveFilter] = useState('Popular');
  const [sortBy, setSortBy] = useState<SortOption>('Newest');
  const [errorMessage, setErrorMessage] = useState('');

  const fromExplore = params.from === 'explore';
  const colors = Colors[colorScheme ?? 'light'];

  const userStandard = useMemo(() => {
    const classValue = user?.class;
    if (!classValue) return undefined;

    const parsed = parseInt(String(classValue), 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  }, [user?.class]);

  const getSubjectDetails = (subject: string | undefined) => {
    switch (subject) {
      case 'Mathematics':
        return {
          icon: 'function',
          color: '#4158D0',
          gradient: ['#4158D0', '#C850C0'] as [string, string],
          accent: '#C850C0',
        };
      case 'Physics':
        return {
          icon: 'atom',
          color: '#00C9A7',
          gradient: ['#00C9A7', '#12B2E2'] as [string, string],
          accent: '#12B2E2',
        };
      case 'Chemistry':
        return {
          icon: 'flask',
          color: '#FF512F',
          gradient: ['#FF512F', '#F09819'] as [string, string],
          accent: '#F09819',
        };
      case 'Biology':
        return {
          icon: 'leaf',
          color: '#11998E',
          gradient: ['#11998E', '#38EF7D'] as [string, string],
          accent: '#38EF7D',
        };
      default:
        return {
          icon: 'book',
          color: ThemeColors.orange,
          gradient: [ThemeColors.orange, ThemeColors.deepBlue] as [string, string],
          accent: ThemeColors.deepBlue,
        };
    }
  };

  const loadExams = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      try {
        if (mode === 'refresh') {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setErrorMessage('');

        let minLoadingTime = 300;

        try {
          const networkSpeed = await detectNetworkSpeed();
          minLoadingTime = getMinLoadingTime(networkSpeed);
        } catch (networkError) {
          console.warn('Network speed detection failed:', networkError);
        }

        const startTime = Date.now();

        const loadedExams = await getExams(
          userStandard,
          selectedSubject ?? undefined,
          selectedExamType === 'All' ? undefined : selectedExamType,
        );

        const elapsedTime = Date.now() - startTime;

        if (elapsedTime < minLoadingTime && mode === 'initial') {
          await new Promise((resolve) =>
            setTimeout(resolve, minLoadingTime - elapsedTime),
          );
        }

        const safeExams = Array.isArray(loadedExams) ? loadedExams : [];
        setExams(safeExams);
      } catch (error) {
        console.error('Failed to load exams:', error);
        setExams([]);
        setErrorMessage('Failed to fetch exams from backend. Please try again.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [userStandard, selectedSubject, selectedExamType],
  );

  useEffect(() => {
    loadExams('initial');
  }, [loadExams]);

  const filteredExams = useMemo(() => {
    const baseFiltered = exams.filter((exam) => {
      const title = (exam.title || '').toLowerCase();
      const subject = exam.subject || '';
      const matchesSearch = title.includes(searchQuery.toLowerCase());
      const matchesSubject = !selectedSubject || subject === selectedSubject;
      return matchesSearch && matchesSubject;
    });

    const activeFiltered = baseFiltered.filter((exam) => {
      const questionCount = Array.isArray(exam.questions) ? exam.questions.length : 0;
      const duration = exam.duration || 0;
      const totalMarks =
        exam.totalMarks ||
        (Array.isArray(exam.questions)
          ? exam.questions.reduce((acc, q) => acc + (q?.marks || 4), 0)
          : 0);

      if (activeFilter === 'Quick Tests') return duration <= 15;
      if (activeFilter === 'Hard') return totalMarks >= 60 || duration >= 45 || questionCount >= 25;
      if (activeFilter === 'Popular') return questionCount >= 10;
      return true;
    });

    const sorted = [...activeFiltered].sort((a, b) => {
      if (sortBy === 'Duration') {
        return (b.duration || 0) - (a.duration || 0);
      }

      if (sortBy === 'Questions') {
        const aQuestions = Array.isArray(a.questions) ? a.questions.length : 0;
        const bQuestions = Array.isArray(b.questions) ? b.questions.length : 0;
        return bQuestions - aQuestions;
      }

      const aTime = new Date(a.createdAt ?? '').getTime() || 0;
      const bTime = new Date(b.createdAt ?? '').getTime() || 0;
      return bTime - aTime;
    });

    return sorted;
  }, [exams, searchQuery, selectedSubject, activeFilter, sortBy]);

  const examsBySubject = useMemo(() => {
    return SUBJECTS.reduce((acc, subject) => {
      const subjectExams = exams.filter((exam) => exam.subject === subject);
      if (subjectExams.length > 0) {
        acc[subject] = subjectExams;
      }
      return acc;
    }, {} as Record<string, Exam[]>);
  }, [exams]);

  const dashboardStats = useMemo(() => {
    const totalExams = exams.length;

    const totalQuestions = exams.reduce((acc, exam) => {
      const questions = Array.isArray(exam.questions) ? exam.questions.length : 0;
      return acc + questions;
    }, 0);

    const totalDuration = exams.reduce((acc, exam) => acc + (exam.duration || 0), 0);
    const averageDuration = totalExams > 0 ? Math.round(totalDuration / totalExams) : 0;

    return {
      totalExams,
      totalQuestions,
      averageDuration,
    };
  }, [exams]);

  return (
    <ThemedView style={styles.container}>
      <PremiumHeader
        title="Activities"
        showBackButton
        onBackPress={fromExplore ? () => router.push('/explore') : undefined}
      />

      <ScrollView
        style={styles.examList}
        contentContainerStyle={styles.examListContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadExams('refresh')} />
        }
      >
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <IconSymbol name="doc.text.fill" size={18} color="#667eea" />
            <ThemedText style={styles.statValue}>{dashboardStats.totalExams}</ThemedText>
            <ThemedText style={styles.statLabel}>Total Exams</ThemedText>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <IconSymbol name="list.bullet.rectangle.fill" size={18} color="#12B2E2" />
            <ThemedText style={styles.statValue}>{dashboardStats.totalQuestions}</ThemedText>
            <ThemedText style={styles.statLabel}>Questions</ThemedText>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <IconSymbol name="clock.fill" size={18} color="#F59E0B" />
            <ThemedText style={styles.statValue}>{dashboardStats.averageDuration}</ThemedText>
            <ThemedText style={styles.statLabel}>Avg Min</ThemedText>
          </View>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.icon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search exams..."
            placeholderTextColor={`${colors.icon}80`}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <IconSymbol name="xmark.circle.fill" size={20} color={colors.icon} />
            </TouchableOpacity>
          ) : null}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.filterScroll, { marginBottom: 12 }]}
          contentContainerStyle={styles.filterContent}
        >
          {EXAM_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.filterChip, selectedExamType === type && styles.filterChipActive]}
              onPress={() => setSelectedExamType(type)}
              activeOpacity={0.8}
            >
              <ThemedText
                style={[
                  styles.filterChipText,
                  selectedExamType === type && styles.filterChipTextActive,
                ]}
              >
                {type}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.filterScroll, { marginBottom: 12 }]}
          contentContainerStyle={styles.filterContent}
        >
          {['Popular', 'Recent', 'Hard', 'Quick Tests'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
              onPress={() => setActiveFilter(filter)}
              activeOpacity={0.8}
            >
              <ThemedText
                style={[
                  styles.filterChipText,
                  activeFilter === filter && styles.filterChipTextActive,
                ]}
              >
                {filter}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.filterScroll, { marginBottom: 20 }]}
          contentContainerStyle={styles.filterContent}
        >
          {SORT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.sortChip, sortBy === option && styles.sortChipActive]}
              onPress={() => setSortBy(option)}
              activeOpacity={0.8}
            >
              <ThemedText
                style={[
                  styles.sortChipText,
                  sortBy === option && styles.sortChipTextActive,
                ]}
              >
                Sort: {option}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {Object.keys(examsBySubject).length > 0 && !selectedSubject && (
          <>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Browse by Subject</ThemedText>
              <ThemedText style={styles.sectionSubtitle}>
                Backend-loaded subjects
              </ThemedText>
            </View>

            <View style={styles.subjectGrid}>
              {SUBJECTS.map((subject) => {
                const subjectExams = examsBySubject[subject] || [];
                const examCount = subjectExams.length;
                const subjectDetails = getSubjectDetails(subject);

                if (examCount === 0) return null;

                return (
                  <TouchableOpacity
                    key={subject}
                    style={styles.subjectCard}
                    onPress={() => setSelectedSubject(subject)}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={subjectDetails.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.subjectCardGradient}
                    >
                      <View style={styles.subjectCardHeader}>
                        <View style={styles.subjectIconContainer}>
                          <IconSymbol name={subjectDetails.icon as any} size={24} color="#FFF" />
                        </View>
                        <View style={styles.subjectCountBadge}>
                          <ThemedText style={styles.subjectCountText}>{examCount}</ThemedText>
                        </View>
                      </View>

                      <ThemedText style={styles.subjectCardTitle}>{subject}</ThemedText>
                      <ThemedText style={styles.subjectCardSubtitle}>
                        {examCount} {examCount === 1 ? 'Exam' : 'Exams'}
                      </ThemedText>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {selectedSubject && (
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.card }]}
            onPress={() => setSelectedSubject(null)}
            activeOpacity={0.8}
          >
            <IconSymbol name="chevron.left" size={18} color={colors.icon} />
            <ThemedText style={styles.backButtonText}>Back to Subjects</ThemedText>
          </TouchableOpacity>
        )}

        {errorMessage ? (
          <View style={styles.messageContainer}>
            <View style={[styles.errorCard, { backgroundColor: colors.card }]}>
              <IconSymbol name="exclamationmark.triangle.fill" size={42} color="#EF4444" />
              <ThemedText style={styles.errorTitle}>Unable to load backend data</ThemedText>
              <ThemedText style={styles.errorDescription}>{errorMessage}</ThemedText>

              <TouchableOpacity style={styles.retryButton} onPress={() => loadExams('initial')}>
                <LinearGradient colors={['#ef4444', '#f97316']} style={styles.retryButtonGradient}>
                  <IconSymbol name="arrow.clockwise" size={14} color="#FFF" />
                  <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        ) : loading ? (
          <View style={styles.skeletonContainer}>
            <ExamSkeleton count={6} />
          </View>
        ) : filteredExams.length === 0 ? (
          <View style={styles.messageContainer}>
            <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
              <IconSymbol name="doc.text.magnifyingglass" size={48} color={ThemeColors.orange} />
              <ThemedText style={styles.emptyTitle}>No Activities Found</ThemedText>
              <ThemedText style={styles.emptyDescription}>
                No backend records matched your current search and filters.
              </ThemedText>

              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedSubject(null);
                  setSelectedExamType('All');
                  setActiveFilter('Popular');
                  setSortBy('Newest');
                }}
              >
                <LinearGradient colors={['#667eea', '#764ba2']} style={styles.resetButtonGradient}>
                  <ThemedText style={styles.resetButtonText}>Reset Filters</ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Activities List</ThemedText>
              <ThemedText style={styles.sectionSubtitle}>
                {filteredExams.length} loaded from backend
              </ThemedText>
            </View>

            <View style={styles.examGrid}>
              {filteredExams.map((exam) => {
                const subjectDetails = getSubjectDetails(exam.subject);
                const questions = Array.isArray(exam.questions) ? exam.questions : [];
                const totalMarks =
                  exam.totalMarks || questions.reduce((acc, q) => acc + (q?.marks || 4), 0);

                return (
                  <Link
                    key={exam._id || exam.id}
                    href={{
                      pathname: '/exam-take',
                      params: { examId: exam._id || exam.id || '' },
                    }}
                    asChild
                  >
                    <TouchableOpacity
                      style={[styles.examCard, { backgroundColor: colors.card }]}
                      activeOpacity={0.92}
                    >
                      <LinearGradient
                        colors={subjectDetails.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.examCardHeader}
                      >
                        <View style={styles.examCardIcon}>
                          <IconSymbol name={subjectDetails.icon as any} size={22} color="#FFF" />
                        </View>

                        <View style={styles.examCardBadge}>
                          <ThemedText style={styles.examCardBadgeText}>
                            {exam.subject || 'General'}
                          </ThemedText>
                        </View>
                      </LinearGradient>

                      <View style={styles.examCardContent}>
                        <ThemedText style={styles.examTitle} numberOfLines={2}>
                          {exam.title || 'Untitled Activity'}
                        </ThemedText>

                        <View style={styles.examMetaRow}>
                          <View style={styles.examMetaItem}>
                            <IconSymbol name="list.bullet" size={14} color={subjectDetails.color} />
                            <ThemedText style={styles.examMetaText}>
                              {questions.length} Questions
                            </ThemedText>
                          </View>

                          <View style={styles.examMetaItem}>
                            <IconSymbol name="clock.fill" size={14} color={subjectDetails.accent} />
                            <ThemedText style={styles.examMetaText}>
                              {exam.duration || 0} min
                            </ThemedText>
                          </View>

                          <View style={styles.examMetaItem}>
                            <IconSymbol name="chart.bar.fill" size={14} color="#22C55E" />
                            <ThemedText style={styles.examMetaText}>
                              {totalMarks} Marks
                            </ThemedText>
                          </View>
                        </View>

                        <View style={styles.examFooter}>
                          <View style={styles.syncInfo}>
                            <IconSymbol name="icloud.and.arrow.down.fill" size={12} color="#22C55E" />
                            <ThemedText style={styles.syncInfoText}>Synced</ThemedText>
                          </View>

                          <LinearGradient
                            colors={[`${subjectDetails.color}20`, `${subjectDetails.accent}20`]}
                            style={styles.startButton}
                          >
                            <ThemedText
                              style={[styles.startButtonText, { color: subjectDetails.color }]}
                            >
                              Open
                            </ThemedText>
                            <IconSymbol name="arrow.right" size={12} color={subjectDetails.color} />
                          </LinearGradient>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </Link>
                );
              })}
            </View>

            {exams.length > 0 && (
              <>
                <View style={[styles.sectionHeader, styles.recentHeader]}>
                  <View>
                    <ThemedText style={styles.sectionTitle}>Recent Backend Records</ThemedText>
                    <ThemedText style={styles.sectionSubtitle}>
                      Latest synced activities
                    </ThemedText>
                  </View>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.recentScroll}
                  contentContainerStyle={styles.recentContent}
                >
                  {exams.slice(0, 5).map((exam) => {
                    const subjectDetails = getSubjectDetails(exam.subject);
                    const questions = Array.isArray(exam.questions) ? exam.questions : [];

                    return (
                      <Link
                        key={`recent-${exam._id || exam.id}`}
                        href={{
                          pathname: '/exam-take',
                          params: { examId: exam._id || exam.id || '' },
                        }}
                        asChild
                      >
                        <TouchableOpacity
                          style={[styles.recentCard, { backgroundColor: colors.card }]}
                          activeOpacity={0.9}
                        >
                          <LinearGradient
                            colors={[`${subjectDetails.color}15`, `${subjectDetails.accent}15`]}
                            style={styles.recentCardGradient}
                          >
                            <View
                              style={[
                                styles.recentIcon,
                                { backgroundColor: `${subjectDetails.color}20` },
                              ]}
                            >
                              <IconSymbol
                                name={subjectDetails.icon as any}
                                size={18}
                                color={subjectDetails.color}
                              />
                            </View>

                            <View style={styles.recentInfo}>
                              <ThemedText style={styles.recentTitle} numberOfLines={1}>
                                {exam.title || 'Untitled Activity'}
                              </ThemedText>
                              <View style={styles.recentMeta}>
                                <ThemedText style={styles.recentMetaText}>
                                  {questions.length} Q
                                </ThemedText>
                                <View style={styles.recentDot} />
                                <ThemedText style={styles.recentMetaText}>
                                  {exam.duration || 0} min
                                </ThemedText>
                              </View>
                            </View>
                          </LinearGradient>
                        </TouchableOpacity>
                      </Link>
                    );
                  })}
                </ScrollView>
              </>
            )}
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  examList: {
    flex: 1,
  },
  examListContent: {
    paddingBottom: 100,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginTop: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.65,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: 0,
  },
  filterScroll: {
    marginBottom: 10,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
  },
  filterChipActive: {
    backgroundColor: '#667eea',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555',
  },
  filterChipTextActive: {
    color: '#FFF',
  },
  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
  },
  sortChipActive: {
    backgroundColor: '#4338CA',
  },
  sortChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4338CA',
  },
  sortChipTextActive: {
    color: '#FFF',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  sectionSubtitle: {
    fontSize: 13,
    opacity: 0.65,
    marginTop: 4,
  },
  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 14,
    marginBottom: 20,
  },
  subjectCard: {
    width: '47%',
    borderRadius: 22,
    overflow: 'hidden',
  },
  subjectCardGradient: {
    padding: 16,
    minHeight: 128,
    justifyContent: 'space-between',
  },
  subjectCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subjectCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  subjectCountText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  subjectCardTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 12,
  },
  subjectCardSubtitle: {
    color: '#FFF',
    fontSize: 12,
    opacity: 0.9,
    marginTop: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  messageContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  errorCard: {
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 30,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 14,
    textAlign: 'center',
  },
  errorDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 20,
  },
  retryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  emptyCard: {
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 30,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 14,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  resetButton: {
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 20,
  },
  resetButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  resetButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  examGrid: {
    paddingHorizontal: 16,
    gap: 14,
  },
  examCard: {
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  examCardHeader: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  examCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  examCardBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  examCardBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  examCardContent: {
    padding: 16,
  },
  examTitle: {
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 24,
    marginBottom: 12,
  },
  examMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  examMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  examMetaText: {
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.75,
  },
  examFooter: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  syncInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  syncInfoText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#22C55E',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  startButtonText: {
    fontSize: 13,
    fontWeight: '800',
  },
  recentHeader: {
    marginTop: 28,
  },
  recentScroll: {
    marginTop: 4,
  },
  recentContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  recentCard: {
    width: 220,
    borderRadius: 20,
    overflow: 'hidden',
  },
  recentCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  recentIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentInfo: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  recentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentMetaText: {
    fontSize: 11,
    fontWeight: '700',
    opacity: 0.65,
  },
  recentDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#A3A3A3',
    marginHorizontal: 8,
  },
  skeletonContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});