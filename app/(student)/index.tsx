import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getDoubts, getExamResults } from '@/services/storage';
import { getVideos, getFlipBooks, getExams } from '@/services/content';
import { examResultService } from '@/services/exam-results';
import type { ExamResult } from '@/types';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
  useWindowDimensions,
  TextInput,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileMenu } from '@/components/profile-menu';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;
const isTablet = screenWidth >= 768;
const isDesktop = screenWidth >= 1024;

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const { user } = useAuth();

  const [stats, setStats] = useState({
    videos: 0,
    flipbooks: 0,
    exams: 0,
    doubts: 0,
    results: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const isCurrentTablet = width >= 768;
  const isCurrentDesktop = width >= 1024;
  const isCurrentSmall = width < 375;

  useEffect(() => {
    loadStats();
  }, [user?.id, user?.class]);

  const mergeExamResultCount = (local: ExamResult[], remote: ExamResult[]) => {
    const m = new Map<string, ExamResult>();
    const add = (r: ExamResult) => {
      const key = `${r.examId}_${new Date(r.completedAt).getTime()}`;
      const prev = m.get(key);
      if (!prev || new Date(r.completedAt) >= new Date(prev.completedAt)) {
        m.set(key, r);
      }
    };
    local.forEach(add);
    remote.forEach(add);
    return m.size;
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      let minLoadingTime = 300;

      try {
        const { detectNetworkSpeed, getMinLoadingTime } = require('@/utils/network');
        const networkSpeed = await detectNetworkSpeed();
        minLoadingTime = getMinLoadingTime(networkSpeed);
      } catch (networkError) {
        console.warn('Network speed detection failed, using default:', networkError);
      }

      const startTime = Date.now();
      const userStandard = user?.class ? parseInt(user.class, 10) : undefined;

      const [videos, flipbooks, exams, doubts, localResults, remoteResults] = await Promise.all([
        getVideos(userStandard),
        getFlipBooks(userStandard),
        getExams(userStandard),
        getDoubts(),
        getExamResults(),
        examResultService.getAllResults().catch(() => [] as ExamResult[]),
      ]);
      const resultsCount = mergeExamResultCount(
        localResults as ExamResult[],
        remoteResults
      );

      const elapsedTime = Date.now() - startTime;

      if (elapsedTime < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
      }

      setStats({
        videos: videos.length,
        flipbooks: flipbooks.length,
        exams: exams.length,
        doubts: doubts.length,
        results: resultsCount,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
      setStats({
        videos: 0,
        flipbooks: 0,
        exams: 0,
        doubts: 0,
        results: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const colors = Colors[colorScheme ?? 'light'];

  const quickAccessItems = [
    {
      name: 'Videos',
      icon: 'play.circle.fill' as const,
      color: ThemeColors.orange,
      href: '/videos' as const,
    },
    {
      name: 'Result',
      icon: 'doc.text.fill' as const,
      color: ThemeColors.deepBlue,
      href: '/reports' as const,
    },
    {
      name: 'Report Issue',
      icon: 'exclamationmark.triangle.fill' as const,
      color: ThemeColors.orange,
      href: '/doubts' as const,
    },
  ];

  const featureItems = [
    {
      name: 'VIDEOS',
      icon: 'play.rectangle.fill' as const,
      color: ThemeColors.orange,
      href: '/videos' as const,
    },
    {
      name: 'FLIP BOOK',
      icon: 'book.closed.fill' as const,
      color: ThemeColors.deepBlue,
      href: '/flipbooks' as const,
    },
    {
      name: 'EXAMS',
      icon: 'doc.text.fill' as const,
      color: ThemeColors.orange,
      href: '/exams' as const,
    },
    {
      name: 'ACTIVITIES',
      icon: 'square.grid.2x2.fill' as const,
      color: ThemeColors.deepBlue,
      href: '/activities' as const,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={ThemeColors.white}
        translucent={false}
      />

      <ThemedView style={styles.container}>
        <View style={styles.headerWrapper}>
          <View style={styles.topHeader}>
            <View style={styles.logoSection}>
              <View style={styles.logoContainer}>
                <Image
                  source={require('@/assets/images/logo.png')}
                  style={styles.logoImage}
                  contentFit="contain"
                />
              </View>
            </View>

            <View style={styles.profileAvatarContainer}>
              <ProfileMenu
                user={{
                  name: user?.name,
                  email: user?.email,
                  role: user?.role,
                  avatarUrl: user?.avatarUrl,
                }}
              />
            </View>
          </View>

          <View style={styles.searchSectionWrapper}>
            <View style={styles.searchSection}>
              <View style={styles.searchContainer}>
                <IconSymbol name="magnifyingglass" size={20} color="#8E8E93" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search"
                  placeholderTextColor="#8E8E93"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
                <IconSymbol
                  name="line.3.horizontal.decrease.circle"
                  size={22}
                  color={ThemeColors.grayText}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.welcomeBanner}>
            <Image
              source={require('@/assets/images/home/image4.png')}
              style={styles.welcomeImage}
              contentFit="cover"
            />
          </View>

          <View style={styles.quickAccessContainer}>
            {quickAccessItems.map((item, index) => (
              <Link key={index} href={item.href} asChild>
                <TouchableOpacity
                  style={[
                    styles.quickAccessCard,
                    styles.cardShadow,
                    index !== quickAccessItems.length - 1 && styles.quickAccessCardSpacing,
                  ]}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.quickAccessIconContainer,
                      { backgroundColor: item.color + '15' },
                    ]}
                  >
                    <IconSymbol name={item.icon} size={26} color={item.color} />
                  </View>

                  <ThemedText
                    style={[styles.quickAccessLabel, { color: ThemeColors.grayText }]}
                    numberOfLines={2}
                  >
                    {item.name}
                  </ThemedText>
                </TouchableOpacity>
              </Link>
            ))}
          </View>

          <View style={styles.featuresContainer}>
            {featureItems.map((item, index) => (
              <Link key={index} href={item.href} asChild>
                <TouchableOpacity style={styles.featureCard} activeOpacity={0.8}>
                  <LinearGradient
                    colors={[item.color, item.color + 'DD']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.featureCardGradient}
                  >
                    <View style={styles.featureCardContent}>
                      <View style={styles.featureTopSection}>
                        <View style={styles.featureIconContainer}>
                          <IconSymbol name={item.icon} size={26} color={ThemeColors.white} />
                        </View>

                        <ThemedText style={[styles.featureTitle, { color: ThemeColors.white }]}>
                          {item.name.toUpperCase()}
                        </ThemedText>
                      </View>

                      <View style={styles.featureArrowButton}>
                        <IconSymbol name="arrow.right" size={16} color={ThemeColors.white} />
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Link>
            ))}
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const getResponsiveValue = (
  small: number,
  medium: number,
  large: number,
  xlarge?: number
) => {
  if (isDesktop && xlarge !== undefined) return xlarge;
  if (isTablet) return large;
  if (isSmallScreen) return small;
  return medium;
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ThemeColors.lightNeutral,
  },
  container: {
    flex: 1,
    backgroundColor: ThemeColors.lightNeutral,
  },
  headerWrapper: {
    backgroundColor: ThemeColors.white,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  pageContainer: {
    width: '100%',
    maxWidth: 1160,
    alignSelf: 'center',
    backgroundColor: ThemeColors.lightNeutral,
    paddingHorizontal: getResponsiveValue(16, 20, 24, 28),
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 10,
    paddingHorizontal: 12,
    backgroundColor: ThemeColors.white,
  },
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  profileAvatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  searchSectionWrapper: {
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 14,
    backgroundColor: ThemeColors.white,
  },
  logoContainer: {
    width: 150,
    height: 60,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginLeft: -4,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    opacity:1,
  },
  appNameContainer: {
    flex: 1,
  },
  appName: {
    fontSize: getResponsiveValue(18, 20, 24, 28),
    fontWeight: '800',
    marginBottom: 2,
  },
  appSubtitle: {
    fontSize: getResponsiveValue(10, 12, 14, 16),
    fontWeight: '600',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    paddingHorizontal: 14,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: ThemeColors.grayText,
    padding: 0,
    marginLeft: 8,
  },
  filterButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    maxWidth: 1160,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 110,
  },
  welcomeBanner: {
    width: '100%',
    marginTop: 4,
    marginBottom: 22,
    borderRadius: 22,
    overflow: 'hidden',
    height: 178,
    backgroundColor: ThemeColors.white,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  welcomeImage: {
    width: '100%',
    height: '100%',
  },
  quickAccessContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 22,
    justifyContent: 'space-between',
  },
  quickAccessCard: {
    flex: 1,
    backgroundColor: ThemeColors.white,
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 130,
  },
  quickAccessCardSpacing: {
    marginRight: 16,
  },
  quickAccessIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickAccessLabel: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 20,
  },
  featuresContainer: {
    gap: 16,
  },
  featureCard: {
    borderRadius: 22,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  featureCardGradient: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 22,
    minHeight: 92,
  },
  featureCardContent: {
    minHeight: 60,
    justifyContent: 'space-between',
  },
  featureTopSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureIconImage: {
    width: getResponsiveValue(40, 44, 48, 52),
    height: getResponsiveValue(40, 44, 48, 52),
  },
  featureTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginLeft: 10,
  },
  featureArrowButton: {
    minWidth: 46,
    height: 32,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'transparent',
    alignSelf: 'flex-end',
    marginTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardShadow: {
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
});