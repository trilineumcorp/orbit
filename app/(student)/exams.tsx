import { PremiumHeader } from '@/components/premium-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getExams, Exam } from '@/services/content';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ExamSkeleton } from '@/components/skeleton';
import { detectNetworkSpeed, getMinLoadingTime } from '@/utils/network';
import { useAuth } from '@/contexts/AuthContext';

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology'];

export default function ExamsScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('Popular');

  const fromExplore = params.from === 'explore';

  // Get user's standard from class field
  const userStandard = user?.class ? parseInt(user.class, 10) : undefined;

  useEffect(() => {
    loadExams();
  }, [userStandard]);

  const loadExams = async () => {
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
      // Filter exams by user's standard if available
      const loadedExams = await getExams(userStandard);
      const elapsedTime = Date.now() - startTime;

      // Ensure minimum loading time for better UX
      if (elapsedTime < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
      }

      setExams(loadedExams);
    } catch (error: any) {
      console.error('Failed to load exams:', error);
      setExams([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = !selectedSubject || exam.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  // Group exams by subject
  const examsBySubject = SUBJECTS.reduce((acc, subject) => {
    const subjectExams = exams.filter(e => e.subject === subject);
    if (subjectExams.length > 0) {
      acc[subject] = subjectExams;
    }
    return acc;
  }, {} as Record<string, Exam[]>);

  const colors = Colors[colorScheme ?? 'light'];

  // Get subject icon and color
  const getSubjectDetails = (subject: string) => {
    switch (subject) {
      case 'Mathematics':
        return {
          icon: 'function',
          color: '#4158D0',
          gradient: ['#4158D0', '#C850C0'] as [string, string],
          accent: '#C850C0'
        };
      case 'Physics':
        return {
          icon: 'atom',
          color: '#00C9A7',
          gradient: ['#00C9A7', '#12B2E2'] as [string, string],
          accent: '#12B2E2'
        };
      case 'Chemistry':
        return {
          icon: 'flask',
          color: '#FF512F',
          gradient: ['#FF512F', '#F09819'] as [string, string],
          accent: '#F09819'
        };
      case 'Biology':
        return {
          icon: 'leaf',
          color: '#11998E',
          gradient: ['#11998E', '#38EF7D'] as [string, string],
          accent: '#38EF7D'
        };
      default:
        return {
          icon: 'book',
          color: ThemeColors.orange,
          gradient: [ThemeColors.orange, ThemeColors.deepBlue] as [string, string],
          accent: ThemeColors.deepBlue
        };
    }
  };

  return (
    <ThemedView style={styles.container}>
      <PremiumHeader
        title="Online Exams"
        showBackButton={true}
        onBackPress={fromExplore ? () => router.push('/explore') : undefined}
      />

      <ScrollView
        style={styles.examList}
        contentContainerStyle={styles.examListContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Hero Banner */}
        <LinearGradient
          colors={['#667eea', '#764ba2', '#6B8DD6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}>
          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <IconSymbol name="star.fill" size={12} color="#FFD700" />
              <ThemedText style={styles.heroBadgeText}>IIT JEE | NEET</ThemedText>
            </View>
            <ThemedText style={styles.heroTitle}>
              Practice with{'\n'}Premium Exams
            </ThemedText>
            <ThemedText style={styles.heroSubtitle}>
              {userStandard ? `Class ${userStandard} • ` : ''}Chapter-wise tests with detailed analysis
            </ThemedText>
            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <IconSymbol name="checkmark.circle.fill" size={16} color="#FFD700" />
                <ThemedText style={styles.heroStatText}>Instant Results</ThemedText>
              </View>
              <View style={styles.heroStat}>
                <IconSymbol name="chart.line.uptrend.xyaxis" size={16} color="#FFD700" />
                <ThemedText style={styles.heroStatText}>Rank Predictor</ThemedText>
              </View>
              <View style={styles.heroStat}>
                <IconSymbol name="clock.fill" size={16} color="#FFD700" />
                <ThemedText style={styles.heroStatText}>Timed Tests</ThemedText>
              </View>
            </View>
          </View>
          <View style={styles.heroPattern}>
            {[...Array(3)].map((_, i) => (
              <View key={i} style={[styles.patternCircle, {
                right: -20 + i * 30,
                top: 10 + i * 20,
                width: 100 + i * 30,
                height: 100 + i * 30,
                opacity: 0.1 - i * 0.02
              }]} />
            ))}
          </View>
        </LinearGradient>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.icon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search exams by topic..."
            placeholderTextColor={colors.icon + '80'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <IconSymbol name="xmark.circle.fill" size={20} color={colors.icon} />
            </TouchableOpacity>
          ) : (
            <View style={styles.searchFilter}>
              <IconSymbol name="line.3.horizontal.decrease" size={20} color={colors.icon} />
            </View>
          )}
        </View>

        {/* Quick Filters */}
        {!selectedSubject && !searchQuery && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterContent}
          >
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === 'Popular' && styles.filterChipActive]}
              onPress={() => setActiveFilter('Popular')}
              activeOpacity={0.7}
            >
              <IconSymbol name="flame.fill" size={14} color={activeFilter === 'Popular' ? "#FFD700" : colors.icon} />
              <ThemedText style={[styles.filterChipText, activeFilter === 'Popular' && styles.filterChipTextActive]}>Popular</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === 'Recent' && styles.filterChipActive]}
              onPress={() => setActiveFilter('Recent')}
              activeOpacity={0.7}
            >
              <IconSymbol name="clock.fill" size={14} color={activeFilter === 'Recent' ? "#FFD700" : colors.icon} />
              <ThemedText style={[styles.filterChipText, activeFilter === 'Recent' && styles.filterChipTextActive]}>Recent</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === 'Hard' && styles.filterChipActive]}
              onPress={() => setActiveFilter('Hard')}
              activeOpacity={0.7}
            >
              <IconSymbol name="chart.line.uptrend.xyaxis" size={14} color={activeFilter === 'Hard' ? "#FFD700" : colors.icon} />
              <ThemedText style={[styles.filterChipText, activeFilter === 'Hard' && styles.filterChipTextActive]}>Hard</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === 'Quick Tests' && styles.filterChipActive]}
              onPress={() => setActiveFilter('Quick Tests')}
              activeOpacity={0.7}
            >
              <IconSymbol name="bolt.fill" size={14} color={activeFilter === 'Quick Tests' ? "#FFD700" : colors.icon} />
              <ThemedText style={[styles.filterChipText, activeFilter === 'Quick Tests' && styles.filterChipTextActive]}>Quick Tests</ThemedText>
            </TouchableOpacity>
          </ScrollView>
        )}

        {selectedSubject && (
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.card }]}
            onPress={() => setSelectedSubject(null)}
            activeOpacity={0.7}>
            <IconSymbol name="chevron.left" size={20} color={colors.icon} />
            <ThemedText style={styles.backButtonText}>Back to Subjects</ThemedText>
            <View style={styles.selectedSubjectBadge}>
              <ThemedText style={styles.selectedSubjectText}>{selectedSubject}</ThemedText>
            </View>
          </TouchableOpacity>
        )}

        {loading ? (
          <View style={styles.skeletonContainer}>
            <ExamSkeleton count={6} />
          </View>
        ) : selectedSubject ? (
          // Show exams for selected subject
          filteredExams.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyCard]}>
                <LinearGradient
                  colors={['#667eea20', '#764ba220']}
                  style={styles.emptyGradient}
                >
                  <View style={styles.emptyIconWrapper}>
                    <IconSymbol name="doc.text.magnifyingglass" size={60} color={ThemeColors.orange} />
                  </View>
                  <ThemedText style={styles.emptyTitle}>No Exams Found</ThemedText>
                  <ThemedText style={styles.emptyDescription}>
                    {searchQuery
                      ? `No exams matching "${searchQuery}" in ${selectedSubject}`
                      : `No exams available for ${selectedSubject} yet`
                    }
                  </ThemedText>
                  <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={() => {
                      setSearchQuery('');
                      if (searchQuery) return;
                      setSelectedSubject(null);
                    }}
                  >
                    <LinearGradient
                      colors={['#667eea', '#764ba2']}
                      style={styles.emptyButtonGradient}
                    >
                      <ThemedText style={styles.emptyButtonText}>
                        {searchQuery ? 'Clear Search' : 'Browse All Subjects'}
                      </ThemedText>
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </View>
          ) : (
            <View style={styles.examGrid}>
              {filteredExams.map((exam, index) => {
                const subjectDetails = getSubjectDetails(exam.subject);
                return (
                  <Link
                    key={exam._id || exam.id}
                    href={{
                      pathname: '/exam-take',
                      params: { examId: exam._id || exam.id || '' },
                    }}
                    asChild>
                    <TouchableOpacity
                      style={[styles.examCard, { backgroundColor: colors.card }]}
                      activeOpacity={0.95}>
                      <LinearGradient
                        colors={subjectDetails.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.examCardHeader}
                      >
                        <View style={styles.examCardIcon}>
                          <IconSymbol name={subjectDetails.icon as any} size={24} color="#FFF" />
                        </View>
                        <View style={styles.examCardBadge}>
                          <ThemedText style={styles.examCardBadgeText}>{exam.subject}</ThemedText>
                        </View>
                      </LinearGradient>

                      <View style={styles.examCardContent}>
                        <ThemedText style={styles.examCardTitle} numberOfLines={2}>
                          {exam.title}
                        </ThemedText>

                        <View style={styles.examCardMeta}>
                          <View style={styles.examMetaItem}>
                            <IconSymbol name="list.bullet" size={14} color={subjectDetails.color} />
                            <ThemedText style={styles.examMetaText}>
                              {exam.questions.length} Ques
                            </ThemedText>
                          </View>
                          <View style={styles.examMetaItem}>
                            <IconSymbol name="clock.fill" size={14} color={subjectDetails.accent} />
                            <ThemedText style={styles.examMetaText}>
                              {exam.duration} min
                            </ThemedText>
                          </View>
                          <View style={styles.examMetaItem}>
                            <IconSymbol name="chart.bar.fill" size={14} color="#4CAF50" />
                            <ThemedText style={styles.examMetaText}>
                              {exam.questions.reduce((acc, q) => acc + (q.marks || 4), 0)} Marks
                            </ThemedText>
                          </View>
                        </View>

                        {exam.startTime && exam.endTime && (
                          <View style={styles.examDateContainer}>
                            <IconSymbol name="calendar" size={12} color={colors.icon} />
                            <ThemedText style={styles.examDate}>
                              {new Date(exam.startTime).toLocaleDateString('en-US', {
                                day: 'numeric',
                                month: 'short'
                              })} - {new Date(exam.endTime).toLocaleDateString('en-US', {
                                day: 'numeric',
                                month: 'short'
                              })}
                            </ThemedText>
                          </View>
                        )}

                        <View style={styles.examCardFooter}>
                          <View style={styles.difficultyIndicator}>
                            <View style={[styles.difficultyDot, { backgroundColor: '#4CAF50' }]} />
                            <ThemedText style={styles.difficultyText}>Medium</ThemedText>
                          </View>
                          <LinearGradient
                            colors={[subjectDetails.color + '20', subjectDetails.accent + '20']}
                            style={styles.startButton}
                          >
                            <ThemedText style={[styles.startButtonText, { color: subjectDetails.color }]}>
                              Start Test
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
          )
        ) : (
          // Show subject folders with enhanced UI
          <>
            {/* Subject Grid */}
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Browse by Subject</ThemedText>
              <ThemedText style={styles.sectionSubtitle}>Chapter-wise practice tests</ThemedText>
            </View>

            <View style={styles.subjectGrid}>
              {SUBJECTS.map(subject => {
                const subjectExams = examsBySubject[subject] || [];
                const subjectDetails = getSubjectDetails(subject);
                const examCount = subjectExams.length;

                if (examCount === 0) return null;

                return (
                  <TouchableOpacity
                    key={subject}
                    style={styles.subjectCard}
                    onPress={() => setSelectedSubject(subject)}
                    activeOpacity={0.9}>
                    <LinearGradient
                      colors={subjectDetails.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.subjectCardGradient}
                    >
                      <View style={styles.subjectCardHeader}>
                        <View style={styles.subjectIconContainer}>
                          <IconSymbol name={subjectDetails.icon as any} size={28} color="#FFF" />
                        </View>
                        <View style={styles.subjectCountBadge}>
                          <ThemedText style={styles.subjectCountText}>{examCount}</ThemedText>
                        </View>
                      </View>
                      <ThemedText style={styles.subjectCardTitle}>{subject}</ThemedText>
                      <ThemedText style={styles.subjectCardSubtitle}>
                        {examCount} Practice {examCount === 1 ? 'Test' : 'Tests'}
                      </ThemedText>
                      <View style={styles.subjectCardFooter}>
                        <View style={styles.subjectProgress}>
                          <View style={[styles.subjectProgressBar, { width: '60%' }]} />
                        </View>
                        <IconSymbol name="arrow.right.circle.fill" size={20} color="#FFF" />
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Recent Exams Section */}
            {exams.length > 0 && (
              <>
                <View style={[styles.sectionHeader, styles.recentHeader]}>
                  <View>
                    <ThemedText style={styles.sectionTitle}>Recent Exams</ThemedText>
                    <ThemedText style={styles.sectionSubtitle}>Continue your preparation</ThemedText>
                  </View>
                  <TouchableOpacity>
                    <ThemedText style={styles.viewAllText}>View All</ThemedText>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.recentScroll}
                  contentContainerStyle={styles.recentContent}
                >
                  {exams.slice(0, 5).map((exam, index) => {
                    const subjectDetails = getSubjectDetails(exam.subject);
                    return (
                      <Link
                        key={exam._id || exam.id}
                        href={{
                          pathname: '/exam-take',
                          params: { examId: exam._id || exam.id || '' },
                        }}
                        asChild>
                        <TouchableOpacity
                          style={[styles.recentCard, { backgroundColor: colors.card }]}
                          activeOpacity={0.9}
                        >
                          <LinearGradient
                            colors={[subjectDetails.color + '15', subjectDetails.accent + '15']}
                            style={styles.recentCardGradient}
                          >
                            <View style={[styles.recentIcon, { backgroundColor: subjectDetails.color + '20' }]}>
                              <IconSymbol name={subjectDetails.icon as any} size={20} color={subjectDetails.color} />
                            </View>
                            <View style={styles.recentInfo}>
                              <ThemedText style={styles.recentTitle} numberOfLines={1}>
                                {exam.title}
                              </ThemedText>
                              <View style={styles.recentMeta}>
                                <IconSymbol name="clock.fill" size={10} color={colors.icon} />
                                <ThemedText style={styles.recentMetaText}>{exam.duration} min</ThemedText>
                                <View style={styles.recentDot} />
                                <ThemedText style={styles.recentMetaText}>{exam.questions.length} Q</ThemedText>
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

            {/* Empty State */}
            {Object.keys(examsBySubject).length === 0 && (
              <View style={styles.emptyContainer}>
                <View style={[styles.emptyCard]}>
                  <LinearGradient
                    colors={['#667eea20', '#764ba220']}
                    style={styles.emptyGradient}
                  >
                    <View style={styles.emptyIconWrapper}>
                      <IconSymbol name="doc.text.fill" size={60} color={ThemeColors.orange} />
                    </View>
                    <ThemedText style={styles.emptyTitle}>No Exams Available</ThemedText>
                    <ThemedText style={styles.emptyDescription}>
                      {userStandard
                        ? `Exams for Class ${userStandard} will be added soon`
                        : 'Check back later for new practice tests'
                      }
                    </ThemedText>
                    <TouchableOpacity style={styles.emptyButton}>
                      <LinearGradient
                        colors={['#667eea', '#764ba2']}
                        style={styles.emptyButtonGradient}
                      >
                        <IconSymbol name="bell.fill" size={16} color="#FFF" />
                        <ThemedText style={styles.emptyButtonText}>Notify Me</ThemedText>
                      </LinearGradient>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              </View>
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
  // Hero Banner
  heroBanner: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
    gap: 6,
  },
  heroBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 40,
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    color: '#FFF',
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 20,
    fontWeight: '500',
  },
  heroStats: {
    flexDirection: 'row',
    gap: 20,
  },
  heroStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroStatText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  heroPattern: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '50%',
  },
  patternCircle: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: '#FFF',
  },
  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 12,
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
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 0,
  },
  searchFilter: {
    padding: 4,
  },
  // Filter Chips
  filterScroll: {
    marginBottom: 24,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 30,
    gap: 8,
  },
  filterChipActive: {
    backgroundColor: '#667eea',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterChipTextActive: {
    color: '#FFF',
  },
  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  recentHeader: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
    opacity: 0.6,
    fontWeight: '500',
    marginTop: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#667eea',
  },
  // Subject Grid
  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 16,
  },
  subjectCard: {
    width: '46%',
    aspectRatio: 1,
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  subjectCardGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  subjectCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  subjectIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subjectCountBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  subjectCountText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  subjectCardTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 8,
  },
  subjectCardSubtitle: {
    color: '#FFF',
    fontSize: 12,
    opacity: 0.9,
    fontWeight: '500',
  },
  subjectCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  subjectProgress: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginRight: 12,
  },
  subjectProgressBar: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 2,
  },
  // Exam Grid
  examGrid: {
    paddingHorizontal: 16,
    gap: 16,
  },
  examCard: {
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  examCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  examCardBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  examCardContent: {
    padding: 16,
  },
  examCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
    marginBottom: 12,
  },
  examCardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  examMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  examMetaText: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.8,
  },
  examDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  examDate: {
    fontSize: 12,
    opacity: 0.6,
    fontWeight: '500',
  },
  examCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  difficultyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.7,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  startButtonText: {
    fontSize: 13,
    fontWeight: '800',
  },
  // Recent Exams
  recentScroll: {
    marginBottom: 20,
  },
  recentContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  recentCard: {
    width: 200,
    borderRadius: 20,
    overflow: 'hidden',
  },
  recentCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  recentIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentInfo: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  recentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recentMetaText: {
    fontSize: 10,
    fontWeight: '600',
    opacity: 0.6,
  },
  recentDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#999',
    marginHorizontal: 4,
  },
  // Back Button
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 12,
    borderRadius: 16,
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  selectedSubjectBadge: {
    backgroundColor: '#667eea20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  selectedSubjectText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#667eea',
  },
  // Empty States
  emptyContainer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  emptyCard: {
    borderRadius: 32,
    overflow: 'hidden',
  },
  emptyGradient: {
    padding: 48,
    alignItems: 'center',
  },
  emptyIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
  },
  emptyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  skeletonContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
});