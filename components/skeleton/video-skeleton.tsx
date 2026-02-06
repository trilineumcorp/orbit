import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { ThemeColors } from '@/constants/theme';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

interface VideoSkeletonProps {
  count?: number;
}

export function VideoSkeleton({ count = 6 }: VideoSkeletonProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <VideoCardSkeleton key={index} />
      ))}
    </View>
  );
}

function VideoCardSkeleton() {
  const shimmer = useSharedValue(0);

  React.useEffect(() => {
    try {
      shimmer.value = withRepeat(
        withTiming(1, { duration: 1500 }),
        -1,
        false
      );
    } catch (error) {
      console.error('Video skeleton animation error:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    try {
      const translateX = interpolate(
        shimmer.value,
        [0, 1],
        [-screenWidth, screenWidth]
      );
      return {
        transform: [{ translateX }],
      };
    } catch (error) {
      return {};
    }
  });

  return (
    <View style={styles.card}>
      <View style={styles.thumbnailContainer}>
        <View style={styles.thumbnail}>
          <Animated.View style={[styles.shimmer, animatedStyle]}>
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.titleLine} />
        <View style={styles.descriptionLine} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 4,
  },
  card: {
    width: '47%',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  thumbnailContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
  },
  shimmer: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 14,
    gap: 8,
  },
  titleLine: {
    height: 16,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    width: '90%',
  },
  descriptionLine: {
    height: 12,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    width: '70%',
  },
});

