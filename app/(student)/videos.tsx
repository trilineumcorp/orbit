import { PremiumHeader } from '@/components/premium-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getVideos, Video } from '@/services/content';
import { getYouTubeThumbnail } from '@/utils/youtube';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { VideoSkeleton } from '@/components/skeleton';
import { detectNetworkSpeed, getMinLoadingTime } from '@/utils/network';
import { useAuth } from '@/contexts/AuthContext';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology'];

export default function VideosScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const fromExplore = params.from === 'explore';

  // Get user's standard from class field
  const userStandard = user?.class ? parseInt(user.class, 10) : undefined;

  useEffect(() => {
    loadVideos();
  }, [userStandard]);

  const loadVideos = async () => {
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
      // Filter videos by user's standard if available
      const loadedVideos = await getVideos(userStandard);
      const elapsedTime = Date.now() - startTime;

      // Ensure minimum loading time for better UX
      if (elapsedTime < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
      }

      setVideos(loadedVideos);
    } catch (error: any) {
      console.error('Failed to load videos:', error);
      setVideos([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = !selectedSubject || video.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  // Group videos by subject
  const videosBySubject = SUBJECTS.reduce((acc, subject) => {
    const subjectVideos = videos.filter(v => v.subject === subject);
    if (subjectVideos.length > 0) {
      acc[subject] = subjectVideos;
    }
    return acc;
  }, {} as Record<string, Video[]>);

  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={styles.container}>
      <PremiumHeader
        title="Video Lectures"
        showBackButton={true}
        onBackPress={fromExplore ? () => router.push('/explore') : undefined}
      />

      <ScrollView
        style={styles.videoList}
        contentContainerStyle={styles.videoListContent}
        showsVerticalScrollIndicator={false}>

        <Animated.View entering={FadeInUp.duration(600).springify()}>
          <ThemedView style={[styles.welcomeCard, { backgroundColor: colors.card }]}>
            <LinearGradient
              colors={[ThemeColors.orange + '15', ThemeColors.deepBlue + '10']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.welcomeGradient}>
              <View style={styles.welcomeContent}>
                <View style={[styles.welcomeIconContainer, { backgroundColor: ThemeColors.orange + '20' }]}>
                  <LinearGradient
                    colors={[ThemeColors.orange, ThemeColors.deepBlue]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.iconGradient}>
                    <IconSymbol name="play.rectangle.fill" size={36} color={ThemeColors.white} />
                  </LinearGradient>
                </View>
                <ThemedText type="title" style={styles.welcomeTitle}>
                  Video Lectures
                </ThemedText>
                <ThemedText style={styles.welcomeDescription}>
                  Master IIT concepts with our curated video lectures from top educators
                </ThemedText>
              </View>
            </LinearGradient>
          </ThemedView>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(100).springify()}>
          <View style={[styles.searchContainer, {
            backgroundColor: colors.card,
            borderColor: isSearchFocused ? ThemeColors.orange + '40' : 'transparent',
            borderWidth: isSearchFocused ? 2 : 0,
          }]}>
            <IconSymbol name="magnifyingglass" size={20} color={ThemeColors.orange} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search for videos..."
              placeholderTextColor={colors.icon + '80'}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <IconSymbol name="xmark.circle.fill" size={18} color={colors.icon} />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {selectedSubject && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: colors.card }]}
              onPress={() => setSelectedSubject(null)}
              activeOpacity={0.7}>
              <View style={[styles.backIconContainer, { backgroundColor: ThemeColors.orange + '15' }]}>
                <IconSymbol name="chevron.left" size={16} color={ThemeColors.orange} />
              </View>
              <ThemedText style={styles.backButtonText}>Back to Subjects</ThemedText>
              <ThemedText style={styles.currentSubjectText}>{selectedSubject}</ThemedText>
            </TouchableOpacity>
          </Animated.View>
        )}

        {loading ? (
          <View style={styles.skeletonContainer}>
            <VideoSkeleton count={6} />
          </View>
        ) : selectedSubject ? (
          // Show videos for selected subject
          filteredVideos.length === 0 ? (
            <Animated.View entering={FadeInUp.duration(600)} style={styles.emptyContainer}>
              <View style={[styles.emptyIconContainer, { backgroundColor: ThemeColors.orange + '10' }]}>
                <LinearGradient
                  colors={[ThemeColors.orange + '80', ThemeColors.deepBlue + '80']}
                  style={styles.emptyGradient}>
                  <IconSymbol name="play.slash" size={48} color={ThemeColors.white} />
                </LinearGradient>
              </View>
              <ThemedText style={styles.emptyText}>No videos found</ThemedText>
              <ThemedText style={styles.emptySubtext}>Check back later for new content</ThemedText>
            </Animated.View>
          ) : (
            <View style={styles.videoGrid}>
              {filteredVideos.map((video, index) => (
                <Animated.View
                  key={video._id || video.id}
                  entering={FadeInDown.duration(400).delay(index * 100).springify()}>
                  <Link
                    href={{
                      pathname: '/video-player',
                      params: {
                        videoId: video._id || video.id || '',
                        title: video.title,
                        url: video.youtubeUrl,
                        ...(fromExplore && { from: 'explore' }),
                      },
                    }}
                    asChild>
                    <TouchableOpacity
                      style={[styles.videoCard, { backgroundColor: colors.card }]}
                      activeOpacity={0.85}>
                      <View style={styles.thumbnailContainer}>
                        <Image
                          source={{ uri: getYouTubeThumbnail(video.youtubeUrl) }}
                          style={styles.thumbnail}
                          contentFit="cover"
                          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
                          transition={200}
                        />
                        <LinearGradient
                          colors={['transparent', 'rgba(0,0,0,0.3)']}
                          style={styles.thumbnailGradient}
                        />
                        <View style={styles.playOverlay}>
                          <View style={styles.playIconContainer}>
                            <LinearGradient
                              colors={[ThemeColors.orange, ThemeColors.deepBlue]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              style={styles.playIconGradient}>
                              <IconSymbol name="play.fill" size={20} color={ThemeColors.white} />
                            </LinearGradient>
                          </View>
                        </View>
                        <View style={styles.durationBadge}>
                          <IconSymbol name="clock" size={10} color={ThemeColors.white} />
                          <ThemedText style={styles.durationText}>12:34</ThemedText>
                        </View>
                      </View>
                      <View style={styles.videoInfo}>
                        <View style={styles.subjectTag}>
                          <View style={[styles.subjectDot, { backgroundColor: ThemeColors.orange }]} />
                          <ThemedText style={styles.subjectTagText}>{video.subject}</ThemedText>
                        </View>
                        <ThemedText type="defaultSemiBold" numberOfLines={2} style={styles.videoTitle}>
                          {video.title}
                        </ThemedText>
                        {video.description ? (
                          <ThemedText style={styles.description} numberOfLines={2}>
                            {video.description}
                          </ThemedText>
                        ) : null}
                        <View style={styles.videoMeta}>
                          <IconSymbol name="eye" size={12} color={colors.icon} />
                          <ThemedText style={styles.viewCount}>1.2k views</ThemedText>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </Link>
                </Animated.View>
              ))}
            </View>
          )
        ) : (
          // Show subject folders
          Object.keys(videosBySubject).length === 0 ? (
            <Animated.View entering={FadeInUp.duration(600)} style={styles.emptyContainer}>
              <View style={[styles.emptyIconContainer, { backgroundColor: ThemeColors.orange + '10' }]}>
                <LinearGradient
                  colors={[ThemeColors.orange + '80', ThemeColors.deepBlue + '80']}
                  style={styles.emptyGradient}>
                  <IconSymbol name="rectangle.stack" size={48} color={ThemeColors.white} />
                </LinearGradient>
              </View>
              <ThemedText style={styles.emptyText}>No videos available</ThemedText>
              <ThemedText style={styles.emptySubtext}>Content is being prepared for you</ThemedText>
            </Animated.View>
          ) : (
            <View style={styles.subjectGrid}>
              {SUBJECTS.map((subject, index) => {
                const subjectVideos = videosBySubject[subject] || [];
                if (subjectVideos.length === 0) return null;
                return (
                  <Animated.View
                    key={subject}
                    entering={FadeInDown.duration(400).delay(index * 100).springify()}
                    style={{ width: '47%' }}>
                    <TouchableOpacity
                      style={[styles.subjectCard, { backgroundColor: colors.card }]}
                      onPress={() => setSelectedSubject(subject)}
                      activeOpacity={0.85}>
                      <LinearGradient
                        colors={[ThemeColors.orange + '08', ThemeColors.deepBlue + '05']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.subjectGradient}>
                        <View style={[styles.subjectIconContainer, { backgroundColor: ThemeColors.orange + '15' }]}>
                          <LinearGradient
                            colors={[ThemeColors.orange, ThemeColors.deepBlue]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.subjectIconGradient}>
                            <IconSymbol name="book.closed.fill" size={28} color={ThemeColors.white} />
                          </LinearGradient>
                        </View>
                        <ThemedText type="defaultSemiBold" style={styles.subjectTitle}>
                          {subject}
                        </ThemedText>
                        <View style={styles.subjectCountContainer}>
                          <ThemedText style={styles.subjectCount}>
                            {subjectVideos.length} {subjectVideos.length === 1 ? 'Lesson' : 'Lessons'}
                          </ThemedText>
                          <IconSymbol name="chevron.right" size={12} color={ThemeColors.orange} />
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          )
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 12,
  },
  clearButton: {
    padding: 8,
  },
  videoList: {
    flex: 1,
  },
  videoListContent: {
    padding: 20,
    paddingBottom: 120,
  },
  welcomeCard: {
    borderRadius: 28,
    marginBottom: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  welcomeGradient: {
    padding: 32,
  },
  welcomeContent: {
    alignItems: 'center',
  },
  welcomeIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  welcomeDescription: {
    fontSize: 15,
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
    maxWidth: '80%',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 4,
    borderRadius: 24,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  videoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 8,
    justifyContent: 'space-between',
  },
  videoCard: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  thumbnailContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
    backgroundColor: ThemeColors.lightNeutral,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  playIconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    color: ThemeColors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  emptyGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoInfo: {
    padding: 16,
  },
  subjectTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  subjectDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  subjectTagText: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.7,
    fontWeight: '500',
    marginBottom: 12,
  },
  videoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewCount: {
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 24,
    letterSpacing: -0.5,
  },
  emptySubtext: {
    fontSize: 15,
    marginTop: 8,
    opacity: 0.6,
    fontWeight: '500',
  },
  skeletonContainer: {
    paddingTop: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
    marginBottom: 20,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  currentSubjectText: {
    fontSize: 14,
    fontWeight: '700',
    opacity: 0.7,
    color: ThemeColors.orange,
  },
  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 8,
    justifyContent: 'space-between',
  },
  subjectCard: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  subjectGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 160,
    justifyContent: 'center',
  },
  subjectIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  subjectIconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subjectTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subjectCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subjectCount: {
    fontSize: 13,
    opacity: 0.6,
    fontWeight: '600',
  },
});