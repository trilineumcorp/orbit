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

interface FlipBookSkeletonProps {
  count?: number;
}

export function FlipBookSkeleton({ count = 6 }: FlipBookSkeletonProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <FlipBookCardSkeleton key={index} />
      ))}
    </View>
  );
}

function FlipBookCardSkeleton() {
  const shimmer = useSharedValue(0);

  React.useEffect(() => {
    try {
      shimmer.value = withRepeat(
        withTiming(1, { duration: 1500 }),
        -1,
        false
      );
    } catch (error) {
      console.error('Flipbook skeleton animation error:', error);
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
        <View style={styles.pdfIcon}>
          <Animated.View style={[styles.shimmer, animatedStyle]}>
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>
        <View style={styles.pdfLines}>
          <View style={styles.pdfLine} />
          <View style={[styles.pdfLine, { width: '80%' }]} />
          <View style={[styles.pdfLine, { width: '90%' }]} />
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.titleLine} />
        <View style={styles.dateLine} />
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
    aspectRatio: 4 / 3,
    position: 'relative',
    backgroundColor: '#E8F4F8',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  pdfIcon: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#D0E0E8',
    position: 'absolute',
    overflow: 'hidden',
  },
  shimmer: {
    width: '100%',
    height: '100%',
  },
  pdfLines: {
    position: 'absolute',
    bottom: 20,
    width: '80%',
    gap: 8,
  },
  pdfLine: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C0D0D8',
    width: '100%',
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
  dateLine: {
    height: 12,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    width: '60%',
  },
});

