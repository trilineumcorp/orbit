import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  useWindowDimensions,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ThemeColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Image } from 'expo-image';
import { AdminDrawer } from '@/components/admin-drawer';
import { Avatar } from '@/components/avatar';
import { getAdminDashboardStats } from '@/services/adminApi';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;
const isTablet = screenWidth >= 768;
const isDesktop = screenWidth >= 1024;

const getResponsiveValue = (small: number, medium: number, large: number, xlarge?: number) => {
  if (isDesktop && xlarge !== undefined) return xlarge;
  if (isTablet) return large;
  if (isSmallScreen) return small;
  return medium;
};

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Popular');
  const [dashStats, setDashStats] = useState<{
    users: { total: number; active: number };
    content: { discussions: number };
    moderation: { totalReports: number; pendingReports: number };
    operations: { totalBulkOperations: number };
  } | null>(null);

  useEffect(() => {
    (async () => {
      const s = await getAdminDashboardStats();
      setDashStats(s);
    })();
  }, []);

  const categories = ['Popular', 'Students', 'Exams', 'Content', 'Reports'];

  const menuItems = [
    {
      id: 'students',
      title: 'Students',
      icon: 'person.2.fill',
      color: '#4CAF50',
      route: '/students',
      category: 'Students',
      stats: { total: 0, active: 0 },
    },
    {
      id: 'exams',
      title: 'Exams',
      icon: 'doc.text.fill',
      color: '#2196F3',
      route: '/exams',
      category: 'Exams',
      stats: { total: 0, active: 0 },
    },
    {
      id: 'content',
      title: 'Content',
      icon: 'book.fill',
      color: '#FF9800',
      route: '/content',
      category: 'Content',
      stats: { total: 0, active: 0 },
    },
    {
      id: 'reports',
      title: 'Reports',
      icon: 'chart.bar.fill',
      color: '#9C27B0',
      route: '/reports',
      category: 'Reports',
      stats: { total: 0, active: 0 },
    },
  ];

  // Filter menu items based on selected category
  const getFilteredMenuItems = () => {
    if (selectedCategory === 'Popular') {
      return menuItems; // Show all items for Popular
    }
    // Filter by selected category
    return menuItems.filter(item => item.category === selectedCategory);
  };

  const filteredMenuItems = getFilteredMenuItems();

  const { height: screenHeight } = useWindowDimensions();
  const headerHeight = screenHeight * 0.25; // 1/4 of screen

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ThemedView style={styles.container}>
        <LinearGradient
        colors={[ThemeColors.deepBlue, '#0A2E3D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { height: headerHeight }]}>
        {/* Top Icons Row */}
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            onPress={() => setDrawerVisible(true)}
            style={styles.menuButton}
            activeOpacity={0.7}>
            <View style={styles.menuButtonCircle}>
              <IconSymbol name="square.grid.2x2.fill" size={20} color={ThemeColors.deepBlue} />
            </View>
          </TouchableOpacity>
          <View style={styles.logoCenterContainer}>
            <TouchableOpacity 
              style={styles.logoContainer}
              onPress={() => router.push('/(admin)/')}
              activeOpacity={1}>
              <View style={styles.logoWrapper}>
                <Image
                  source={require('@/assets/images/logowhite.png')}
                  style={styles.logoImage}
                  contentFit="contain"
                />
              </View>
            </TouchableOpacity>
          </View>
          {/* <TouchableOpacity
            onPress={() => setDrawerVisible(true)}
            style={styles.notificationButton}
            activeOpacity={0.7}>
            <IconSymbol name="bell.fill" size={24} color={ThemeColors.lightNeutral} />
          </TouchableOpacity> */}
        </View>
        
        {/* Greeting Text in Header */}
        {/* <View style={styles.headerGreeting}>
          <ThemedText style={[styles.greetingText, { color: ThemeColors.lightNeutral }]}>
            Transform your <ThemedText style={styles.greetingHighlight}>platform</ThemedText> with us
          </ThemedText>
        </View> */}

        {/* Search Bar - Overlapping Header and Content */}
        <View style={styles.searchSectionOverlap}>
          <View style={styles.searchContainer}>
            <IconSymbol name="magnifyingglass" size={20} color="#8E8E93" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search courses, mentors..."
              placeholderTextColor="#8E8E93"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity activeOpacity={0.7}>
              <IconSymbol name="slider.horizontal.3" size={20} color="#8E8E93" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Overlapping white content area */}
      <View style={styles.contentOverlap}>
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>

        {/* Category Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryPill,
                selectedCategory === category && styles.categoryPillActive,
                {
                  backgroundColor:
                    selectedCategory === category
                      ? ThemeColors.deepBlue
                      : colorScheme === 'dark'
                      ? '#2A4D5D'
                      : '#F5F5F5',
                },
              ]}
              onPress={() => setSelectedCategory(category)}
              activeOpacity={0.7}>
              <ThemedText
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive,
                  {
                    color:
                      selectedCategory === category
                        ? '#FFF'
                        : colorScheme === 'dark'
                        ? '#FFF'
                        : '#333',
                  },
                ]}>
                {category}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {dashStats && (
          <View style={[styles.liveStatsBar, colorScheme === 'dark' && styles.liveStatsBarDark]}>
            <ThemedText style={styles.liveStatsTitle}>Live overview</ThemedText>
            <View style={styles.liveStatsRow}>
              <View style={styles.liveStatCell}>
                <ThemedText style={styles.liveStatNum}>{dashStats.users.total}</ThemedText>
                <ThemedText style={styles.liveStatLbl}>Users</ThemedText>
              </View>
              <View style={styles.liveStatCell}>
                <ThemedText style={styles.liveStatNum}>{dashStats.users.active}</ThemedText>
                <ThemedText style={styles.liveStatLbl}>Active (7d)</ThemedText>
              </View>
              <View style={styles.liveStatCell}>
                <ThemedText style={styles.liveStatNum}>{dashStats.content.discussions}</ThemedText>
                <ThemedText style={styles.liveStatLbl}>Discussions</ThemedText>
              </View>
              <View style={styles.liveStatCell}>
                <ThemedText style={styles.liveStatNum}>{dashStats.moderation.pendingReports}</ThemedText>
                <ThemedText style={styles.liveStatLbl}>Reports</ThemedText>
              </View>
            </View>
          </View>
        )}

        {/* Content Cards */}
        <View style={styles.cardsContainer}>
          {filteredMenuItems.length > 0 ? (
            filteredMenuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.contentCard, colorScheme === 'dark' && styles.contentCardDark]}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.8}>
                {/* Instructor/Admin Info Row */}
                <View style={styles.cardInstructorRow}>
                  <View style={styles.instructorInfo}>
                    <Avatar
                      name={user?.name ?? user?.email ?? 'Admin'}
                      email={user?.email}
                      avatarUrl={user?.avatarUrl ?? null}
                      size="medium"
                      showBorder={false}
                    />
                    <View style={styles.instructorDetails}>
                      <ThemedText style={styles.instructorName}>{user?.name || 'Admin User'}</ThemedText>
                      <View style={styles.ratingContainer}>
                        <IconSymbol name="star.fill" size={14} color="#FFD700" />
                        <ThemedText style={styles.ratingText}>4.9 (33 reviews)</ThemedText>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity activeOpacity={0.7} style={styles.favoriteButton}>
                    <IconSymbol name="heart.fill" size={22} color={ThemeColors.deepBlue} />
                  </TouchableOpacity>
                </View>

                {/* Course/Module Title */}
                <ThemedText style={styles.cardTitle}>
                  {item.id === 'students' && 'Basics of Student Management'}
                  {item.id === 'exams' && 'Basics of Exam Administration'}
                  {item.id === 'content' && 'Basics of Content Management'}
                  {item.id === 'reports' && 'Basics of Analytics & Reports'}
                </ThemedText>

                {/* Description */}
                <ThemedText style={styles.cardDescription}>
                  {item.id === 'students' && 'Student management is the process of creating, organizing, and overseeing student accounts, enrollments, and academic progress throughout their educational journey...'}
                  {item.id === 'exams' && 'Exam administration involves creating, scheduling, and monitoring examination activities to ensure fair assessment and academic integrity...'}
                  {item.id === 'content' && 'Content management is the process of uploading, organizing, and maintaining educational materials and resources for effective learning delivery...'}
                  {item.id === 'reports' && 'Analytics and reporting provide insights into student performance, platform usage, and detailed metrics to help make informed decisions...'}
                </ThemedText>

                {/* Stats Grid - 2x2 */}
                <View style={styles.statsGrid}>
                  {item.id === 'students' && (
                    <>
                      <View style={styles.statBox}>
                        <IconSymbol name="person.2.fill" size={18} color={item.color} />
                        <ThemedText style={[styles.statValue, { color: item.color }]}>250 students</ThemedText>
                      </View>
                      <View style={styles.statBox}>
                        <IconSymbol name="checkmark.circle.fill" size={18} color={item.color} />
                        <ThemedText style={[styles.statValue, { color: item.color }]}>180 active</ThemedText>
                      </View>
                      <View style={styles.statBox}>
                        <IconSymbol name="clock.fill" size={18} color={item.color} />
                        <ThemedText style={[styles.statValue, { color: item.color }]}>12.30 hours</ThemedText>
                      </View>
                      <View style={styles.statBox}>
                        <IconSymbol name="chart.bar.fill" size={18} color={item.color} />
                        <ThemedText style={[styles.statValue, { color: item.color }]}>85% engaged</ThemedText>
                      </View>
                    </>
                  )}
                  {item.id === 'exams' && (
                    <>
                      <View style={styles.statBox}>
                        <IconSymbol name="doc.text.fill" size={18} color={item.color} />
                        <ThemedText style={[styles.statValue, { color: item.color }]}>45 exams</ThemedText>
                      </View>
                      <View style={styles.statBox}>
                        <IconSymbol name="calendar.fill" size={18} color={item.color} />
                        <ThemedText style={[styles.statValue, { color: item.color }]}>12 scheduled</ThemedText>
                      </View>
                      <View style={styles.statBox}>
                        <IconSymbol name="checkmark.circle.fill" size={18} color={item.color} />
                        <ThemedText style={[styles.statValue, { color: item.color }]}>850 attempts</ThemedText>
                      </View>
                      <View style={styles.statBox}>
                        <IconSymbol name="chart.line.uptrend.xyaxis.fill" size={18} color={item.color} />
                        <ThemedText style={[styles.statValue, { color: item.color }]}>78% avg score</ThemedText>
                      </View>
                    </>
                  )}
                  {item.id === 'content' && (
                    <>
                      <View style={styles.statBox}>
                        <IconSymbol name="video.fill" size={18} color={item.color} />
                        <ThemedText style={[styles.statValue, { color: item.color }]}>120 videos</ThemedText>
                      </View>
                      <View style={styles.statBox}>
                        <IconSymbol name="book.fill" size={18} color={item.color} />
                        <ThemedText style={[styles.statValue, { color: item.color }]}>85 flipbooks</ThemedText>
                      </View>
                      <View style={styles.statBox}>
                        <IconSymbol name="doc.text.fill" size={18} color={item.color} />
                        <ThemedText style={[styles.statValue, { color: item.color }]}>200 lessons</ThemedText>
                      </View>
                      <View style={styles.statBox}>
                        <IconSymbol name="eye.fill" size={18} color={item.color} />
                        <ThemedText style={[styles.statValue, { color: item.color }]}>15K views</ThemedText>
                      </View>
                    </>
                  )}
                  {item.id === 'reports' && (
                    <>
                      <View style={styles.statBox}>
                        <IconSymbol name="chart.bar.fill" size={18} color={item.color} />
                        <ThemedText style={[styles.statValue, { color: item.color }]}>25 reports</ThemedText>
                      </View>
                      <View style={styles.statBox}>
                        <IconSymbol name="calendar.fill" size={18} color={item.color} />
                        <ThemedText style={[styles.statValue, { color: item.color }]}>This month</ThemedText>
                      </View>
                      <View style={styles.statBox}>
                        <IconSymbol name="person.2.fill" size={18} color={item.color} />
                        <ThemedText style={[styles.statValue, { color: item.color }]}>250 analyzed</ThemedText>
                      </View>
                      <View style={styles.statBox}>
                        <IconSymbol name="arrow.up.right.fill" size={18} color={item.color} />
                        <ThemedText style={[styles.statValue, { color: item.color }]}>+15% growth</ThemedText>
                      </View>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <IconSymbol name="tray.fill" size={64} color={ThemeColors.grayText} />
              <ThemedText style={styles.emptyStateText}>
                No content available for {selectedCategory}
              </ThemedText>
            </View>
          )}
        </View>
        </ScrollView>
      </View>

        <AdminDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ThemeColors.deepBlue,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: Platform.OS === 'ios' 
      ? getResponsiveValue(50, 60, 70, 80)
      : getResponsiveValue(40, 50, 60, 70),
    paddingBottom: getResponsiveValue(60, 70, 80, 90),
    paddingHorizontal: getResponsiveValue(16, 20, 32, 40),
    borderBottomLeftRadius: getResponsiveValue(40, 50, 60, 70),
    borderBottomRightRadius: getResponsiveValue(40, 50, 60, 70),
    overflow: 'visible',
    position: 'relative',
    zIndex: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: getResponsiveValue(12, 16, 20, 24),
    maxWidth: isDesktop ? 1200 : '100%',
    alignSelf: 'center',
    width: '100%',
    position: 'relative',
    marginBottom: getResponsiveValue(16, 20, 24, 28),
  },
  headerGreeting: {
    paddingHorizontal: getResponsiveValue(16, 20, 32, 40),
    maxWidth: isDesktop ? 1200 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  logoCenterContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    pointerEvents: 'box-none',
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonCircle: {
    width: getResponsiveValue(32, 36, 40, 44),
    height: getResponsiveValue(32, 36, 40, 44),
    borderRadius: getResponsiveValue(16, 18, 20, 22),
    backgroundColor: '#E5E5E5',
    borderWidth: 1,
    borderColor: ThemeColors.deepBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationButton: {
    padding: 8,
    borderRadius: 8,
    zIndex: 2,
  },
  greetingText: {
    fontSize: getResponsiveValue(24, 28, 32, 36),
    fontWeight: '700',
    lineHeight: getResponsiveValue(32, 36, 40, 44),
  },
  greetingHighlight: {
    fontWeight: '800',
    fontStyle: 'italic',
    color: ThemeColors.lightNeutral,
  },
  searchSectionOverlap: {
    position: 'absolute',
    bottom: getResponsiveValue(-30, -35, -40, -45),
    left: 0,
    right: 0,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    left: 18,
    bottom: 18,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 9999, // Fully rounded pill shape
    paddingHorizontal: getResponsiveValue(20, 24, 28, 32),
    paddingVertical: getResponsiveValue(10, 12, 14, 16),
    gap: getResponsiveValue(12, 14, 16, 18),
    width: '92%',
    maxWidth: isDesktop ? 1400 : screenWidth * 0.92,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  searchInput: {
    flex: 1,
    fontSize: getResponsiveValue(15, 16, 17, 18),
    color: '#333',
    paddingVertical: 0,
    height: getResponsiveValue(20, 22, 24, 26),
  },
  categoryScroll: {
    marginTop: getResponsiveValue(8, 12, 16, 20),
    marginBottom: getResponsiveValue(20, 24, 28, 32),
  },
  categoryContainer: {
    paddingHorizontal: getResponsiveValue(16, 20, 32, 40),
    gap: getResponsiveValue(10, 12, 16, 20),
  },
  categoryPill: {
    paddingHorizontal: getResponsiveValue(16, 20, 24, 28),
    paddingVertical: getResponsiveValue(10, 12, 14, 16),
    borderRadius: getResponsiveValue(20, 24, 28, 32),
  },
  categoryPillActive: {
    // Active state handled by backgroundColor
  },
  categoryText: {
    fontSize: getResponsiveValue(14, 16, 18, 20),
    fontWeight: '600',
  },
  categoryTextActive: {
    fontWeight: '700',
  },
  cardsContainer: {
    paddingHorizontal: getResponsiveValue(16, 20, 32, 40),
    paddingBottom: getResponsiveValue(20, 24, 28, 32),
    gap: getResponsiveValue(16, 20, 24, 28),
    maxWidth: isDesktop ? 1200 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: getResponsiveValue(16, 20, 24, 28),
    padding: getResponsiveValue(16, 20, 24, 28),
    marginBottom: getResponsiveValue(16, 20, 24, 28),
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
  contentCardDark: {
    backgroundColor: '#1A3D4D',
  },
  cardInstructorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: getResponsiveValue(12, 16, 20, 24),
  },
  instructorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveValue(10, 12, 14, 16),
    flex: 1,
  },
  instructorDetails: {
    flex: 1,
    gap: getResponsiveValue(4, 6, 8, 10),
  },
  instructorName: {
    fontSize: getResponsiveValue(16, 18, 20, 22),
    fontWeight: '700',
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveValue(4, 6, 8, 10),
  },
  ratingText: {
    fontSize: getResponsiveValue(12, 14, 16, 18),
    color: '#666',
    fontWeight: '500',
  },
  favoriteButton: {
    padding: getResponsiveValue(4, 6, 8, 10),
  },
  cardTitle: {
    fontSize: getResponsiveValue(20, 22, 26, 30),
    fontWeight: '700',
    color: '#333',
    marginBottom: getResponsiveValue(8, 10, 12, 14),
  },
  cardDescription: {
    fontSize: getResponsiveValue(14, 15, 17, 19),
    color: '#666',
    lineHeight: getResponsiveValue(20, 22, 24, 26),
    marginBottom: getResponsiveValue(16, 20, 24, 28),
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getResponsiveValue(12, 16, 20, 24),
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveValue(8, 10, 12, 14),
    paddingVertical: getResponsiveValue(8, 10, 12, 14),
  },
  statValue: {
    fontSize: getResponsiveValue(13, 15, 17, 19),
    fontWeight: '600',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    width: getResponsiveValue(120, 150, 180, 200),
    height: getResponsiveValue(120, 150, 180, 200),
    borderRadius: getResponsiveValue(16, 20, 24, 28),
    backgroundColor: 'transparent',
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },
  contentOverlap: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: getResponsiveValue(40, 50, 60, 70),
    borderTopRightRadius: getResponsiveValue(40, 50, 60, 70),
    marginTop: getResponsiveValue(-30, -40, -50, -60),
    paddingTop: getResponsiveValue(55, 65, 75, 85),
    zIndex: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: getResponsiveValue(0, 0, 0, 0),
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: getResponsiveValue(60, 80, 100, 120),
    minHeight: 300,
  },
  emptyStateText: {
    marginTop: getResponsiveValue(16, 20, 24, 28),
    fontSize: getResponsiveValue(16, 18, 20, 22),
    fontWeight: '600',
    color: ThemeColors.grayText,
    textAlign: 'center',
    opacity: 0.7,
  },
  liveStatsBar: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#E8F4FD',
    borderWidth: 1,
    borderColor: '#C5DDF0',
  },
  liveStatsBarDark: {
    backgroundColor: '#1A3D4D',
    borderColor: '#2A4D5D',
  },
  liveStatsTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
    opacity: 0.85,
  },
  liveStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  liveStatCell: {
    minWidth: '22%',
    alignItems: 'center',
  },
  liveStatNum: {
    fontSize: 18,
    fontWeight: '800',
    color: ThemeColors.deepBlue,
  },
  liveStatLbl: {
    fontSize: 10,
    opacity: 0.75,
    marginTop: 2,
    textAlign: 'center',
  },
});