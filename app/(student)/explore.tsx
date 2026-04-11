import { PremiumHeader } from '@/components/premium-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
  StatusBar
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 48) / 2;

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [activeCategory, setActiveCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const clampedScrollY = Animated.diffClamp(scrollY, 0, 130);
  const headerTranslateY = clampedScrollY.interpolate({
    inputRange: [0, 130],
    outputRange: [0, -130],
    extrapolate: 'clamp',
  });

  const features = [
    {
      id: 'videos',
      title: 'Video Lectures',
      icon: 'play.circle.fill',
      gradient: ['#FF6B6B', '#FF8E53'] as const,
      href: '/videos',
      badge: { text: 'NEW', color: '#FFD700' },
      stats: '500+ Videos',
      bgPattern: '🎥',
      category: 'Learning',
    },
    {
      id: 'flipbooks',
      title: 'Flip Books',
      icon: 'book.circle.fill',
      gradient: ['#4834D4', '#686DE0'] as const,
      href: '/flipbooks',
      stats: 'Interactive',
      bgPattern: '📚',
      category: 'Learning',
    },
    {
  id: 'activities',
  title: 'Activities',
  icon: 'figure.walk.circle.fill',
  gradient: ['#00B894', '#00CEC9'] as const,
  href: '/activities',
  badge: { text: 'HOT', color: '#FF7675' },
  stats: 'Daily Tasks',
  bgPattern: '🎯',
  category: 'Assessment',
},
    {
      id: 'omr',
      title: 'OMR Scanner',
      icon: 'camera.circle.fill',
      gradient: ['#6C5CE7', '#A363D9'] as const,
      href: '/omr-scanner',
      stats: 'AI Powered',
      bgPattern: '📸',
      category: 'Assessment',
    },
    {
      id: 'doubts',
      title: 'Doubts',
      icon: 'bubble.left.circle.fill',
      gradient: ['#FDCB6E', '#FFA502'] as const,
      href: '/doubts',
      stats: '24/7 Support',
      bgPattern: '💬',
      category: 'Support',
    },
    {
      id: 'reports',
      title: 'Reports',
      icon: 'chart.pie.circle.fill',
      gradient: ['#E84342', '#FF7675'] as const,
      href: '/reports',
      stats: 'Analytics',
      bgPattern: '📊',
      category: 'Assessment',
    },
  ];

  const categories = ['All', 'Learning', 'Assessment', 'Support'];

  const filteredFeatures = activeCategory === 'All'
    ? features
    : features.filter(f => f.category === activeCategory);

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Animated.View style={[styles.header, { transform: [{ translateY: headerTranslateY }] }]}>
        <PremiumHeader title="Explore" />
      </Animated.View>

      <Animated.ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}>
          {categories.map((category, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setActiveCategory(category)}
              activeOpacity={0.7}
              style={[
                styles.categoryChip,
                activeCategory === category && styles.categoryChipActive,
              ]}>
              <ThemedText
                style={[
                  styles.categoryText,
                  activeCategory === category && styles.categoryTextActive,
                ]}>
                {category}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Section */}
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <View>
              <ThemedText style={styles.sectionTitle}>Featured</ThemedText>
              <ThemedText style={styles.sectionSubtitle}>Most popular features</ThemedText>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => scrollViewRef.current?.scrollTo({ y: 480, animated: true })}
            >
              <ThemedText style={styles.seeAllText}>See All</ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.featuredScroll}>
            {features.slice(0, 3).map((feature, index) => (
              <Link key={feature.id} href={feature.href as any} asChild>
                <TouchableOpacity activeOpacity={0.9}>
                  <LinearGradient
                    colors={feature.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.featuredCard, index === 0 && styles.firstFeaturedCard]}>
                    <View style={styles.featuredCardPattern}>
                      <ThemedText style={styles.patternText}>{feature.bgPattern}</ThemedText>
                    </View>
                    <View style={styles.featuredCardContent}>
                      <View style={styles.featuredIconContainer}>
                        <IconSymbol name={feature.icon as any} size={32} color="#FFF" />
                      </View>
                      <View style={styles.featuredTextContainer}>
                        <ThemedText style={styles.featuredCardTitle}>{feature.title}</ThemedText>
                        <ThemedText style={styles.featuredCardStats}>{feature.stats}</ThemedText>
                      </View>
                      {feature.badge && (
                        <View style={[styles.featuredBadge, { backgroundColor: feature.badge.color }]}>
                          <ThemedText style={styles.featuredBadgeText}>{feature.badge.text}</ThemedText>
                        </View>
                      )}
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Link>
            ))}
          </ScrollView>
        </View>

        {/* All Features Grid */}
        <View style={styles.allFeaturesSection}>
          <View style={styles.sectionHeader}>
            <View>
              <ThemedText style={styles.sectionTitle}>All Features</ThemedText>
              <ThemedText style={styles.sectionSubtitle}>Everything you need</ThemedText>
            </View>
            <View style={styles.gridToggle}>
              <TouchableOpacity
                style={[styles.gridToggleItem, viewMode === 'grid' && styles.gridToggleActive]}
                onPress={() => setViewMode('grid')}
                activeOpacity={0.7}>
                <IconSymbol name="square.grid.2x2.fill" size={18} color={viewMode === 'grid' ? "#FFF" : "#999"} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.gridToggleItem, viewMode === 'list' && styles.gridToggleActive]}
                onPress={() => setViewMode('list')}
                activeOpacity={0.7}>
                <IconSymbol name="list.bullet" size={18} color={viewMode === 'list' ? "#FFF" : "#999"} />
              </TouchableOpacity>
            </View>
          </View>

          {viewMode === 'grid' ? (
            <View style={styles.featuresGrid}>
              {filteredFeatures.map((feature, index) => (
                <Link key={feature.id} href={feature.href as any} asChild>
                  <TouchableOpacity activeOpacity={0.9}>
                    <View style={styles.gridCard}>
                      <LinearGradient
                        colors={feature.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gridCardGradient}>
                        <View style={styles.gridCardPattern}>
                          <ThemedText style={styles.gridPatternText}>{feature.bgPattern}</ThemedText>
                        </View>
                        <View style={styles.gridCardHeader}>
                          <View style={styles.gridIconContainer}>
                            <IconSymbol name={feature.icon as any} size={24} color="#FFF" />
                          </View>
                          {feature.badge && (
                            <View style={[styles.gridBadge, { backgroundColor: feature.badge.color }]}>
                              <ThemedText style={styles.gridBadgeText}>{feature.badge.text}</ThemedText>
                            </View>
                          )}
                        </View>
                        <View style={styles.gridCardFooter}>
                          <ThemedText style={styles.gridCardTitle}>{feature.title}</ThemedText>
                          <ThemedText style={styles.gridCardStats}>{feature.stats}</ThemedText>
                        </View>
                      </LinearGradient>
                    </View>
                  </TouchableOpacity>
                </Link>
              ))}
            </View>
          ) : (
            <View style={styles.featuresList}>
              {filteredFeatures.map((feature, index) => (
                <Link key={feature.id} href={feature.href as any} asChild>
                  <TouchableOpacity activeOpacity={0.9}>
                    <View style={styles.listCard}>
                      <LinearGradient
                        colors={feature.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.listCardGradient}>
                        <View style={styles.listIconContainer}>
                          <IconSymbol name={feature.icon as any} size={24} color="#FFF" />
                        </View>
                        <View style={styles.listCardContent}>
                          <View style={styles.listCardHeader}>
                            <ThemedText style={styles.listCardTitle}>{feature.title}</ThemedText>
                            {feature.badge && (
                              <View style={[styles.listBadge, { backgroundColor: feature.badge.color }]}>
                                <ThemedText style={styles.listBadgeText}>{feature.badge.text}</ThemedText>
                              </View>
                            )}
                          </View>
                          <ThemedText style={styles.listCardStats}>{feature.stats}</ThemedText>
                        </View>
                        <View style={styles.listArrow}>
                          <IconSymbol name="chevron.right" size={20} color="#FFF" />
                        </View>
                      </LinearGradient>
                    </View>
                  </TouchableOpacity>
                </Link>
              ))}
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <ThemedText style={styles.quickActionsTitle}>Quick Actions</ThemedText>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickAction}>
              <View style={[styles.quickActionIcon, { backgroundColor: ThemeColors.orange + '20' }]}>
                <IconSymbol name="clock.arrow.circlepath" size={24} color={ThemeColors.orange} />
              </View>
              <ThemedText style={styles.quickActionText}>Continue{'\n'}Learning</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAction}>
              <View style={[styles.quickActionIcon, { backgroundColor: ThemeColors.deepBlue + '20' }]}>
                <IconSymbol name="bookmark.fill" size={24} color={ThemeColors.deepBlue} />
              </View>
              <ThemedText style={styles.quickActionText}>Bookmarked{'\n'}Items</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAction}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#00B894' + '20' }]}>
                <IconSymbol name="trophy.fill" size={24} color="#00B894" />
              </View>
              <ThemedText style={styles.quickActionText}>Achievements</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAction}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#6C5CE7' + '20' }]}>
                <IconSymbol name="bell.fill" size={24} color="#6C5CE7" />
              </View>
              <ThemedText style={styles.quickActionText}>Notifications</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </Animated.ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 130,
    paddingBottom: 20,
  },
  categoriesContainer: {
    maxHeight: 50,
    marginBottom: 24,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryChipActive: {
    backgroundColor: ThemeColors.deepBlue,
    borderColor: ThemeColors.deepBlue,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  categoryTextActive: {
    color: '#FFF',
  },
  featuredSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },
  seeAllText: {
    fontSize: 14,
    color: ThemeColors.orange,
    fontWeight: '600',
  },
  featuredScroll: {
    paddingLeft: 20,
  },
  featuredCard: {
    width: width * 0.7,
    height: 140,
    borderRadius: 25,
    marginRight: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  firstFeaturedCard: {
    marginLeft: 0,
  },
  featuredCardPattern: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    opacity: 0.1,
  },
  patternText: {
    fontSize: 100,
  },
  featuredCardContent: {
    flex: 1,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featuredTextContainer: {
    flex: 1,
  },
  featuredCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  featuredCardStats: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  allFeaturesSection: {
    marginBottom: 32,
  },
  gridToggle: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 25,
    padding: 4,
  },
  gridToggleItem: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridToggleActive: {
    backgroundColor: ThemeColors.deepBlue,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  gridCard: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 25,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  gridCardGradient: {
    flex: 1,
    padding: 16,
    position: 'relative',
  },
  gridCardPattern: {
    position: 'absolute',
    right: -5,
    bottom: -5,
    opacity: 0.1,
  },
  gridPatternText: {
    fontSize: 70,
  },
  gridCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  gridIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  gridBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
  gridCardFooter: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  gridCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  gridCardStats: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  featuresList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  listCard: {
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  listCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  listIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listCardContent: {
    flex: 1,
  },
  listCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  listCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
  },
  listCardStats: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  listBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  listBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
  listArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    width: (width - 64) / 4,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '600',
    color: '#666',
    lineHeight: 14,
  },
  bottomPadding: {
    height: 40,
  },
});