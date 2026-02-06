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

export default function ExamsScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
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

  const filteredExams = exams.filter(exam =>
    exam.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={styles.container}>
      <PremiumHeader
        title="Online Exams"
        showBackButton={true}
        onBackPress={fromExplore ? () => router.push('/explore') : undefined}
      />

      <ScrollView style={styles.examList} contentContainerStyle={styles.examListContent} showsVerticalScrollIndicator={false}>
        
        <ThemedView style={[styles.welcomeCard, { backgroundColor: colors.card }]}>
          <LinearGradient
            colors={[ThemeColors.orange + '25', ThemeColors.deepBlue + '20', ThemeColors.orange + '15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.welcomeGradient}>
            <View style={styles.welcomeContent}>
              <View style={styles.welcomeIconWrapper}>
                <View style={[styles.welcomeIconContainer, { backgroundColor: ThemeColors.orange + '30' }]}>
                  <LinearGradient
                    colors={[ThemeColors.orange, '#FF8C5A', ThemeColors.orange]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.welcomeIconGradient}>
                    <View style={styles.welcomeIconGlow} />
                    <IconSymbol name="doc.text.fill" size={48} color={ThemeColors.white} />
                  </LinearGradient>
                </View>
                <View style={styles.welcomeIconRing} />
              </View>
              <ThemedText type="title" style={styles.welcomeTitle}>
                Online Exams
              </ThemedText>
              <ThemedText style={styles.welcomeDescription}>
                Take IIT-based practice exams to test your knowledge and track progress
              </ThemedText>
              <View style={styles.welcomeStats}>
                <View style={styles.welcomeStatItem}>
                  <IconSymbol name="checkmark.circle.fill" size={16} color={ThemeColors.orange} />
                  <ThemedText style={styles.welcomeStatText}>Instant Results</ThemedText>
                </View>
                <View style={styles.welcomeStatItem}>
                  <IconSymbol name="chart.bar.fill" size={16} color={ThemeColors.deepBlue} />
                  <ThemedText style={styles.welcomeStatText}>Track Progress</ThemedText>
                </View>
              </View>
            </View>
          </LinearGradient>
        </ThemedView>

        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.icon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search exams..."
            placeholderTextColor={colors.icon}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        {loading ? (
          <View style={styles.skeletonContainer}>
            <ExamSkeleton count={4} />
          </View>
        ) : filteredExams.length === 0 ? (
          <ThemedView style={styles.emptyContainer}>
            <ThemedView style={[styles.emptyCard, { backgroundColor: colors.card }]}>
              <LinearGradient
                colors={[ThemeColors.orange + '20', ThemeColors.deepBlue + '15']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.emptyGradient}>
                <View style={[styles.emptyIconContainer, { backgroundColor: ThemeColors.orange + '30' }]}>
                  <LinearGradient
                    colors={[ThemeColors.orange, '#FF8C5A']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.emptyIconGradient}>
                    <IconSymbol name="doc.text.fill" size={64} color={ThemeColors.white} />
                  </LinearGradient>
                </View>
                <ThemedText type="title" style={styles.emptyText}>No Exams Yet</ThemedText>
                <ThemedText style={styles.emptySubtext}>
                  Create your first exam to start testing knowledge and tracking progress
                </ThemedText>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => router.push('/exam-create')}
                  activeOpacity={0.8}>
                  <LinearGradient
                    colors={[ThemeColors.orange, '#FF8C5A']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.emptyButtonGradient}>
                    <IconSymbol name="plus.circle.fill" size={20} color={ThemeColors.white} />
                    <ThemedText style={{ color: ThemeColors.white, fontWeight: '700', marginLeft: 8 }}>
                      Create Exam
                    </ThemedText>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </ThemedView>
          </ThemedView>
        ) : (
          <View style={styles.examGrid}>
            {filteredExams.map(exam => (
              <Link
                key={exam._id || exam.id}
                href={{
                  pathname: '/exam-take',
                  params: { examId: exam._id || exam.id || '' },
                }}
                asChild>
                <TouchableOpacity
                  style={[styles.examCard, { backgroundColor: colors.card }]}
                  activeOpacity={0.85}>
                  <View style={styles.thumbnailContainer}>
                    <LinearGradient
                      colors={[ThemeColors.orange + '25', ThemeColors.deepBlue + '20', ThemeColors.orange + '15']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.examGradient}>
                      <View style={styles.examIconWrapper}>
                        <IconSymbol name="doc.text.fill" size={56} color={ThemeColors.orange} />
                      </View>
                      <View style={styles.examLines}>
                        <View style={[styles.examLine, { width: '75%' }]} />
                        <View style={[styles.examLine, { width: '85%' }]} />
                        <View style={[styles.examLine, { width: '70%' }]} />
                        <View style={[styles.examLine, { width: '80%' }]} />
                      </View>
                    </LinearGradient>
                    <View style={styles.examOverlay}>
                      <View style={styles.examBadge}>
                        <IconSymbol name="doc.text.fill" size={10} color={ThemeColors.white} />
                        <ThemedText style={styles.examBadgeText}>EXAM</ThemedText>
                      </View>
                    </View>
                    <View style={styles.playOverlay}>
                      <View style={styles.playIconContainer}>
                        <IconSymbol name="play.fill" size={24} color={ThemeColors.white} />
                      </View>
                    </View>
                  </View>
                  <View style={styles.examInfo}>
                    <ThemedText type="defaultSemiBold" numberOfLines={2} style={styles.examTitle}>
                      {exam.title}
                    </ThemedText>
                    <View style={styles.examDetailsRow}>
                      <View style={styles.examDetailItem}>
                        <IconSymbol name="list.bullet" size={12} color={ThemeColors.orange} />
                        <ThemedText style={styles.examDetails}>
                          {exam.questions.length} Questions
                        </ThemedText>
                      </View>
                      <View style={styles.examDetailItem}>
                        <IconSymbol name="clock.fill" size={12} color={ThemeColors.deepBlue} />
                        <ThemedText style={styles.examDetails}>
                          {exam.duration} min
                        </ThemedText>
                      </View>
                    </View>
                    {exam.startTime && exam.endTime && (
                      <ThemedText style={styles.examTime} numberOfLines={1}>
                        {new Date(exam.startTime).toLocaleDateString()} - {new Date(exam.endTime).toLocaleDateString()}
                      </ThemedText>
                    )}
                  </View>
                </TouchableOpacity>
              </Link>
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  examList: {
    flex: 1,
  },
  examListContent: {
    padding: 20,
    paddingBottom: 100,
  },
  welcomeCard: {
    borderRadius: 32,
    marginBottom: 28,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: ThemeColors.white + '50',
    ...Platform.select({
      ios: {
        shadowColor: ThemeColors.orange,
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.25,
        shadowRadius: 28,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  welcomeGradient: {
    padding: 36,
    borderWidth: 1,
    borderColor: ThemeColors.white + '30',
    borderRadius: 32,
  },
  welcomeContent: {
    alignItems: 'center',
  },
  welcomeIconWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  welcomeIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: ThemeColors.orange,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  welcomeIconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  welcomeIconGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: ThemeColors.white + '25',
    borderRadius: 28,
  },
  welcomeIconRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: ThemeColors.orange + '30',
    top: -10,
    left: -10,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  welcomeDescription: {
    fontSize: 16,
    opacity: 0.95,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '600',
    marginBottom: 20,
  },
  welcomeStats: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 8,
  },
  welcomeStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ThemeColors.lightNeutral,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    gap: 8,
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
  welcomeStatText: {
    fontSize: 13,
    fontWeight: '700',
    opacity: 0.9,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 18,
    borderRadius: 20,
    gap: 14,
    borderWidth: 1.5,
    borderColor: ThemeColors.white + '40',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  examGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 4,
  },
  examCard: {
    width: '47%',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: ThemeColors.white + '40',
    ...Platform.select({
      ios: {
        shadowColor: ThemeColors.orange,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  thumbnailContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
    backgroundColor: ThemeColors.lightNeutral,
    overflow: 'hidden',
  },
  examGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  examIconWrapper: {
    marginBottom: 16,
  },
  examLines: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  examLine: {
    height: 4,
    backgroundColor: ThemeColors.orange + '50',
    borderRadius: 2,
  },
  examOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 10,
  },
  examBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ThemeColors.orange + 'F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 5,
    borderWidth: 1,
    borderColor: ThemeColors.white + '40',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  examBadgeText: {
    color: ThemeColors.white,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  playIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: ThemeColors.orange + 'F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3.5,
    borderColor: ThemeColors.white + '60',
    ...Platform.select({
      ios: {
        shadowColor: ThemeColors.orange,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  examInfo: {
    padding: 16,
    backgroundColor: ThemeColors.white + 'F8',
  },
  examTitle: {
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 22,
    letterSpacing: 0.3,
    marginBottom: 10,
  },
  examDetailsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 8,
  },
  examDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  examDetails: {
    fontSize: 12,
    opacity: 0.85,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  examTime: {
    fontSize: 11,
    opacity: 0.75,
    fontWeight: '600',
    marginTop: 6,
    letterSpacing: 0.2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyCard: {
    borderRadius: 28,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  emptyGradient: {
    padding: 48,
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: ThemeColors.orange,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  emptyIconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 26,
    fontWeight: '900',
    marginTop: 8,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  emptySubtext: {
    fontSize: 16,
    marginBottom: 32,
    opacity: 0.85,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyButton: {
    borderRadius: 18,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: ThemeColors.orange,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  emptyButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    position: 'relative',
    marginRight: 18,
  },
  iconInnerGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: ThemeColors.white + '20',
    borderRadius: 20,
  },
  badgeGradient: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: ThemeColors.white + '15',
    borderRadius: 28,
  },
  skeletonContainer: {
    paddingTop: 4,
  },
});

