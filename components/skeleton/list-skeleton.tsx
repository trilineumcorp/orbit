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

interface ListSkeletonProps {
  count?: number;
  itemHeight?: number;
}

export function ListSkeleton({ count = 5, itemHeight = 80 }: ListSkeletonProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <ListItemSkeleton key={index} height={itemHeight} />
      ))}
    </View>
  );
}

function ListItemSkeleton({ height }: { height: number }) {
  const shimmer = useSharedValue(0);

  React.useEffect(() => {
    try {
      shimmer.value = withRepeat(
        withTiming(1, { duration: 1500 }),
        -1,
        false
      );
    } catch (error) {
      console.error('List skeleton animation error:', error);
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
    <View style={[styles.item, { height }]}>
      <View style={styles.icon}>
        <Animated.View style={[styles.shimmer, animatedStyle]}>
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
      <View style={styles.content}>
        <View style={styles.titleLine} />
        <View style={styles.subtitleLine} />
      </View>
      <View style={styles.chevron} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    gap: 12,
  },
  icon: {
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
  content: {
    flex: 1,
    gap: 8,
  },
  titleLine: {
    height: 16,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    width: '70%',
  },
  subtitleLine: {
    height: 12,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    width: '50%',
  },
  chevron: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E0E0E0',
  },
});

