import { PremiumHeader } from '@/components/premium-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getVideos, Video } from '@/services/content';
import { getWatchLater } from '@/services/storage';
import { getYouTubeThumbnail } from '@/utils/youtube';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { VideoSkeleton } from '@/components/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';

export default function WatchLaterScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { user } = useAuth();
  const [bookmarkedVideos, setBookmarkedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  const userStandard = user?.class ? parseInt(user.class, 10) : undefined;

  useFocusEffect(
    useCallback(() => {
      loadBookmarked();
    }, [userStandard])
  );

  const loadBookmarked = async () => {
    try {
      setLoading(true);
      const allVideos = await getVideos(userStandard);
      const watchLaterIds = await getWatchLater();
      
      const filtered = allVideos.filter(v => watchLaterIds.includes(v._id || v.id || ''));
      setBookmarkedVideos(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={styles.container}>
      <PremiumHeader
        title="Watch Later"
        showBackButton={true}
      />
      
      <ScrollView
        style={styles.videoList}
        contentContainerStyle={styles.videoListContent}
        showsVerticalScrollIndicator={false}>
        
        {loading ? (
          <View style={styles.skeletonContainer}>
            <VideoSkeleton count={3} />
          </View>
        ) : bookmarkedVideos.length === 0 ? (
          <Animated.View entering={FadeInUp.duration(600)} style={styles.emptyContainer}>
             <View style={[styles.emptyIconContainer, { backgroundColor: ThemeColors.orange + '10' }]}>
               <LinearGradient
                  colors={[ThemeColors.orange + '80', ThemeColors.deepBlue + '80']}
                  style={styles.emptyGradient}>
                  <IconSymbol name="bookmark.slash.fill" size={48} color={ThemeColors.white} />
               </LinearGradient>
             </View>
             <ThemedText style={styles.emptyText}>No saved videos</ThemedText>
             <ThemedText style={styles.emptySubtext}>Videos you bookmark will appear here.</ThemedText>
          </Animated.View>
        ) : (
          <View style={styles.videoGrid}>
            {bookmarkedVideos.map((video, index) => (
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
                    </View>
                    <View style={styles.videoInfo}>
                      <View style={styles.subjectTag}>
                        <View style={[styles.subjectDot, { backgroundColor: ThemeColors.orange }]} />
                        <ThemedText style={styles.subjectTagText}>{video.subject}</ThemedText>
                      </View>
                      <ThemedText type="defaultSemiBold" numberOfLines={2} style={styles.videoTitle}>
                        {video.title}
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                </Link>
              </Animated.View>
             ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  videoList: { flex: 1 },
  videoListContent: { padding: 20, paddingBottom: 120 },
  videoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 8, justifyContent: 'space-between' },
  videoCard: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 4,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 16 },
      android: { elevation: 6 },
    }),
  },
  thumbnailContainer: { width: '100%', aspectRatio: 16 / 9, position: 'relative', backgroundColor: ThemeColors.lightNeutral },
  thumbnail: { width: '100%', height: '100%' },
  thumbnailGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%' },
  playOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  playIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  playIconGradient: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  videoInfo: { padding: 16 },
  subjectTag: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 },
  subjectDot: { width: 8, height: 8, borderRadius: 4 },
  subjectTagText: { fontSize: 12, fontWeight: '600', opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.5 },
  videoTitle: { fontSize: 16, fontWeight: '800', lineHeight: 22, letterSpacing: -0.3, marginBottom: 8 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyIconContainer: { width: 120, height: 120, borderRadius: 32, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  emptyGradient: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 22, fontWeight: '700', marginTop: 24, letterSpacing: -0.5 },
  emptySubtext: { fontSize: 15, marginTop: 8, opacity: 0.6, fontWeight: '500' },
  skeletonContainer: { paddingTop: 8 },
});
