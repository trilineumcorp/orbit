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

export default function VideosScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
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

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        
        <ThemedView style={[styles.welcomeCard, { backgroundColor: colors.card }]}>
          <LinearGradient
            colors={[ThemeColors.orange + '20', ThemeColors.deepBlue + '20']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.welcomeGradient}>
            <View style={styles.welcomeContent}>
              <View style={[styles.welcomeIconContainer, { backgroundColor: ThemeColors.orange + '30' }]}>
                <IconSymbol name="play.rectangle.fill" size={40} color={ThemeColors.orange} />
              </View>
              <ThemedText type="title" style={styles.welcomeTitle}>
                Video Lectures
              </ThemedText>
              <ThemedText style={styles.welcomeDescription}>
                Watch educational videos from YouTube to enhance your IIT preparation
              </ThemedText>
            </View>
          </LinearGradient>
        </ThemedView>

        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.icon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search videos..."
            placeholderTextColor={colors.icon}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        {loading ? (
          <View style={styles.skeletonContainer}>
            <VideoSkeleton count={6} />
          </View>
        ) : filteredVideos.length === 0 ? (
          <ThemedView style={styles.emptyContainer}>
            <View style={[styles.emptyIconContainer, { backgroundColor: ThemeColors.orange + '20' }]}>
              <IconSymbol name="play.rectangle.fill" size={64} color={ThemeColors.orange} />
            </View>
            <ThemedText style={styles.emptyText}>No videos available</ThemedText>
            <ThemedText style={styles.emptySubtext}>Videos will appear here when added by admin</ThemedText>
          </ThemedView>
        ) : (
          <View style={styles.videoGrid}>
            {filteredVideos.map(video => (
              <Link
                key={video._id || video.id}
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
                    <View style={styles.playOverlay}>
                      <View style={styles.playIconContainer}>
                        <IconSymbol name="play.fill" size={24} color={ThemeColors.white} />
                      </View>
                    </View>
                    <View style={styles.videoBadge}>
                      <IconSymbol name="play.rectangle.fill" size={10} color={ThemeColors.white} />
                    </View>
                  </View>
                  <View style={styles.videoInfo}>
                    <ThemedText type="defaultSemiBold" numberOfLines={2} style={styles.videoTitle}>
                      {video.title}
                    </ThemedText>
                    {video.description ? (
                      <ThemedText style={styles.description} numberOfLines={2}>
                        {video.description}
                      </ThemedText>
                    ) : (
                      <ThemedText style={styles.descriptionPlaceholder} numberOfLines={2}>
                        Educational video lecture for IIT preparation
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
  },
  videoList: {
    flex: 1,
  },
  videoListContent: {
    padding: 20,
    paddingBottom: 120,
  },
  welcomeCard: {
    borderRadius: 24,
    marginBottom: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  welcomeGradient: {
    padding: 28,
  },
  welcomeContent: {
    alignItems: 'center',
  },
  welcomeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeDescription: {
    fontSize: 15,
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    gap: 12,
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
  videoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 4,
  },
  videoCard: {
    width: '47%',
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
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
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  playIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: ThemeColors.orange + 'E6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: ThemeColors.white + '50',
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
  videoBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: ThemeColors.deepBlue + 'E6',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoInfo: {
    padding: 14,
  },
  videoTitle: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
    letterSpacing: 0.2,
    marginBottom: 6,
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.8,
    fontWeight: '500',
  },
  descriptionPlaceholder: {
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.6,
    fontStyle: 'italic',
    fontWeight: '400',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 15,
    marginTop: 8,
    opacity: 0.7,
    fontWeight: '500',
  },
  skeletonContainer: {
    paddingTop: 4,
  },
});

