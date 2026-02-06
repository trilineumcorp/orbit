import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getDoubts, getExamResults } from '@/services/storage';
import { getVideos, getFlipBooks, getExams } from '@/services/content';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View, Dimensions, useWindowDimensions, TextInput } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileMenu } from '@/components/profile-menu';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;
const isTablet = screenWidth >= 768;
const isDesktop = screenWidth >= 1024;

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const { width, height } = useWindowDimensions();
  const [stats, setStats] = useState({
    videos: 0,
    flipbooks: 0,
    exams: 0,
    doubts: 0,
    results: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Responsive values
  const isCurrentTablet = width >= 768;
  const isCurrentDesktop = width >= 1024;
  const isCurrentSmall = width < 375;

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      let minLoadingTime = 300; // Default minimum loading time
      
      try {
        const { detectNetworkSpeed, getMinLoadingTime } = require('@/utils/network');
        const networkSpeed = await detectNetworkSpeed();
        minLoadingTime = getMinLoadingTime(networkSpeed);
      } catch (networkError) {
        console.warn('Network speed detection failed, using default:', networkError);
      }
      
      const startTime = Date.now();
      // Get user's standard from class field
      const userStandard = user?.class ? parseInt(user.class, 10) : undefined;
      const [videos, flipbooks, exams, doubts, results] = await Promise.all([
        getVideos(userStandard),
        getFlipBooks(userStandard),
        getExams(userStandard),
        getDoubts(),
        getExamResults(),
      ]);

      const elapsedTime = Date.now() - startTime;
      
      // Ensure minimum loading time for better UX
      if (elapsedTime < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
      }

      setStats({
        videos: videos.length,
        flipbooks: flipbooks.length,
        exams: exams.length,
        doubts: doubts.length,
        results: results.length,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
      // Set default stats on error
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
  const { user } = useAuth();

  const quickAccessItems = [
    { name: 'Videos', icon: 'play.circle.fill' as const, color: ThemeColors.orange, href: '/videos' as const },
    { name: 'Result', icon: 'doc.text.fill' as const, color: ThemeColors.deepBlue, href: '/reports' as const },
    { name: 'Report Issue', icon: 'exclamationmark.triangle.fill' as const, color: ThemeColors.orange, href: '/doubts' as const },
  ];

  const featureItems = [
    { name: 'VIDEOS', icon: 'play.rectangle.fill' as const, color: ThemeColors.orange, href: '/videos' as const },
    { name: 'FLIP BOOK', icon: 'book.closed.fill' as const, color: ThemeColors.deepBlue, href: '/flipbooks' as const },
    { name: 'EXAMS', icon: 'doc.text.fill' as const, color: ThemeColors.orange, href: '/exams' as const },
    { name: 'OMR SCANNER', icon: 'camera.fill' as const, color: ThemeColors.deepBlue, href: '/omr-scanner' as const },
  ];

  return (
    <ThemedView style={styles.container}>
      {/* Top Header with Logo and Profile Avatar */}
      <View style={styles.topHeader}>
        {/* Logo and App Name Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/viswasnav.png')}
              style={styles.logoImage}
              contentFit="cover"
            />
          </View>
          <View style={styles.appNameContainer}>
            <ThemedText style={[styles.appName, { color: ThemeColors.deepBlue }]}>
              VISHWAS EDUTECH
            </ThemedText>
            <ThemedText style={[styles.appSubtitle, { color: ThemeColors.orange }]}>
              IIT FOUNDATION | MEDICAL
            </ThemedText>
          </View>
        </View>

        {/* Profile Avatar at Top Right */}
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

      {/* Search Bar Section */}
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
            <IconSymbol name="line.3.horizontal.decrease.circle" size={24} color={ThemeColors.grayText} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        
        {/* Welcome Banner */}
        <View style={styles.welcomeBanner}>
          <Image
            source={require('@/assets/images/home/image4.png')}
            style={styles.welcomeImage}
            contentFit="cover"
          />
        </View>

        {/* Quick Access Cards */}
        <View style={styles.quickAccessContainer}>
          {quickAccessItems.map((item, index) => (
            <Link key={index} href={item.href} asChild>
              <TouchableOpacity
                style={[styles.quickAccessCard, styles.cardShadow]}
                activeOpacity={0.7}>
                <View style={[styles.quickAccessIconContainer, { backgroundColor: item.color + '15' }]}>
                  <IconSymbol name={item.icon} size={32} color={item.color} />
                </View>
                <ThemedText style={[styles.quickAccessLabel, { color: ThemeColors.grayText }]}>
                  {item.name}
                </ThemedText>
              </TouchableOpacity>
            </Link>
          ))}
        </View>

        {/* Feature Cards */}
        <View style={styles.featuresContainer}>
          {featureItems.map((item, index) => (
            <Link key={index} href={item.href} asChild>
              <TouchableOpacity
                style={styles.featureCard}
                activeOpacity={0.8}>
                <LinearGradient
                  colors={[item.color, item.color + 'DD']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.featureCardGradient}>
                  <View style={styles.featureCardContent}>
                    <View style={styles.featureTopSection}>
                      <View style={styles.featureIconContainer}>
                        {item.name === 'OMR SCANNER' ? (
                          <Image
                            source={require('@/assets/images/home/image2.png')}
                            style={styles.featureIconImage}
                            contentFit="contain"
                          />
                        ) : (
                          <IconSymbol name={item.icon} size={32} color={ThemeColors.white} />
                        )}
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
  );
}

const getResponsiveValue = (small: number, medium: number, large: number, xlarge?: number) => {
  if (isDesktop && xlarge !== undefined) return xlarge;
  if (isTablet) return large;
  if (isSmallScreen) return small;
  return medium;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ThemeColors.lightNeutral,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' 
      ? getResponsiveValue(50, 60, 70, 80)
      : getResponsiveValue(40, 50, 60, 70),
    paddingBottom: getResponsiveValue(12, 16, 20, 24),
    paddingHorizontal: getResponsiveValue(16, 20, 24, 28),
    backgroundColor: ThemeColors.white,
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
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: getResponsiveValue(10, 12, 16, 18),
  },
  profileAvatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: getResponsiveValue(12, 16, 20, 24),
  },
  searchSectionWrapper: {
    paddingHorizontal: getResponsiveValue(16, 20, 24, 28),
    paddingBottom: getResponsiveValue(12, 16, 20, 24),
    backgroundColor: ThemeColors.white,
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
  logoContainer: {
    width: getResponsiveValue(50, 60, 70, 80),
    height: getResponsiveValue(50, 60, 70, 80),
    borderRadius: getResponsiveValue(25, 30, 35, 40),
    overflow: 'hidden',
    backgroundColor: ThemeColors.orange + '20',
    padding: getResponsiveValue(4, 6, 8, 10),
  },
  logoImage: {
    width: '100%',
    height: '100%',
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
    gap: getResponsiveValue(10, 12, 14, 16),
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: getResponsiveValue(12, 14, 16, 18),
    paddingHorizontal: getResponsiveValue(12, 14, 16, 18),
    paddingVertical: getResponsiveValue(10, 12, 14, 16),
    gap: getResponsiveValue(8, 10, 12, 14),
  },
  searchInput: {
    flex: 1,
    fontSize: getResponsiveValue(14, 16, 18, 20),
    color: ThemeColors.grayText,
    padding: 0,
  },
  filterButton: {
    padding: getResponsiveValue(8, 10, 12, 14),
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: getResponsiveValue(100, 120, 140, 160),
  },
  welcomeBanner: {
    marginHorizontal: getResponsiveValue(16, 20, 24, 28),
    marginTop: getResponsiveValue(16, 20, 24, 28),
    marginBottom: getResponsiveValue(20, 24, 28, 32),
    borderRadius: getResponsiveValue(20, 24, 28, 32),
    overflow: 'hidden',
    height: getResponsiveValue(200, 220, 240, 260),
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
  welcomeImage: {
    width: '100%',
    height: '100%',
  },
  quickAccessContainer: {
    flexDirection: 'row',
    paddingHorizontal: getResponsiveValue(16, 20, 24, 28),
    marginBottom: getResponsiveValue(20, 24, 28, 32),
    gap: getResponsiveValue(12, 14, 16, 18),
  },
  quickAccessCard: {
    flex: 1,
    backgroundColor: ThemeColors.white,
    borderRadius: getResponsiveValue(16, 18, 20, 22),
    padding: getResponsiveValue(16, 18, 20, 22),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: getResponsiveValue(100, 110, 120, 130),
  },
  quickAccessIconContainer: {
    width: getResponsiveValue(56, 64, 72, 80),
    height: getResponsiveValue(56, 64, 72, 80),
    borderRadius: getResponsiveValue(16, 18, 20, 22),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getResponsiveValue(10, 12, 14, 16),
  },
  quickAccessLabel: {
    fontSize: getResponsiveValue(12, 14, 16, 18),
    fontWeight: '700',
    textAlign: 'center',
  },
  featuresContainer: {
    paddingHorizontal: getResponsiveValue(16, 20, 24, 28),
    gap: getResponsiveValue(16, 18, 20, 22),
  },
  featureCard: {
    borderRadius: getResponsiveValue(20, 22, 24, 24),
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
  featureCardGradient: {
    padding: getResponsiveValue(10, 12, 14, 16),
    borderRadius: getResponsiveValue(20, 22, 24, 24),
    minHeight: getResponsiveValue(80, 90, 100, 110),
  },
  featureCardContent: {
    flexDirection: 'column',
    minHeight: getResponsiveValue(55, 65, 70, 75),
    justifyContent: 'space-between',
  },
  featureTopSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIconContainer: {
    width: getResponsiveValue(40, 44, 48, 52),
    height: getResponsiveValue(40, 44, 48, 52),
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureIconImage: {
    width: getResponsiveValue(40, 44, 48, 52),
    height: getResponsiveValue(40, 44, 48, 52),
  },
  featureTitle: {
    flex: 1,
    fontSize: getResponsiveValue(14, 16, 18, 20),
    fontWeight: '800',
    letterSpacing: 1,
    marginLeft: getResponsiveValue(8, 10, 12, 14),
  },
  featureArrowButton: {
    minWidth: getResponsiveValue(40, 50, 60, 65),
    height: getResponsiveValue(28, 32, 36, 40),
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getResponsiveValue(12, 14, 16, 18),
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'transparent',
    alignSelf: 'flex-end',
    marginTop: 'auto',
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