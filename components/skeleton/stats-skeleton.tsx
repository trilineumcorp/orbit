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

export function StatsSkeleton() {
  const shimmer = useSharedValue(0);

  React.useEffect(() => {
    try {
      shimmer.value = withRepeat(
        withTiming(1, { duration: 1500 }),
        -1,
        false
      );
    } catch (error) {
      console.error('Stats skeleton animation error:', error);
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
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((index) => (
        <View key={index} style={styles.statCard}>
          <Animated.View style={[styles.shimmer, animatedStyle]}>
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
          <View style={styles.statIcon} />
          <View style={styles.statContent}>
            <View style={styles.statLabel} />
            <View style={styles.statValue} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 20,
  },
  statCard: {
    width: '47%',
    height: 100,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    padding: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  shimmer: {
    width: '100%',
    height: '100%',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    marginBottom: 12,
  },
  statContent: {
    gap: 8,
  },
  statLabel: {
    height: 12,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    width: '60%',
  },
  statValue: {
    height: 20,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    width: '80%',
  },
});

