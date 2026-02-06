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

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

interface ExamSkeletonProps {
  count?: number;
}

export function ExamSkeleton({ count = 4 }: ExamSkeletonProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <ExamCardSkeleton key={index} />
      ))}
    </View>
  );
}

function ExamCardSkeleton() {
  const shimmer = useSharedValue(0);

  React.useEffect(() => {
    try {
      shimmer.value = withRepeat(
        withTiming(1, { duration: 1500 }),
        -1,
        false
      );
    } catch (error) {
      console.error('Exam skeleton animation error:', error);
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
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Animated.View style={[styles.shimmer, animatedStyle]}>
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>
        <View style={styles.headerContent}>
          <View style={styles.titleLine} />
          <View style={styles.subtitleLine} />
        </View>
      </View>
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <View style={styles.detailLabel} />
          <View style={styles.detailValue} />
        </View>
        <View style={styles.detailItem}>
          <View style={styles.detailLabel} />
          <View style={styles.detailValue} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    marginTop: 4,
  },
  card: {
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    padding: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
  },
  shimmer: {
    width: '100%',
    height: '100%',
  },
  headerContent: {
    flex: 1,
    gap: 8,
  },
  titleLine: {
    height: 18,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    width: '80%',
  },
  subtitleLine: {
    height: 14,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    width: '60%',
  },
  details: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailLabel: {
    height: 14,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    width: 100,
  },
  detailValue: {
    height: 14,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    width: 60,
  },
});

