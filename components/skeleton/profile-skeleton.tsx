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

export function ProfileSkeleton() {
  const shimmer = useSharedValue(0);

  React.useEffect(() => {
    try {
      shimmer.value = withRepeat(
        withTiming(1, { duration: 1500 }),
        -1,
        false
      );
    } catch (error) {
      console.error('Profile skeleton animation error:', error);
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
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
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
      <View style={styles.infoSection}>
        {[1, 2, 3, 4].map((index) => (
          <View key={index} style={styles.infoItem}>
            <View style={styles.label} />
            <View style={styles.value} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
  },
  shimmer: {
    width: '100%',
    height: '100%',
  },
  infoSection: {
    gap: 16,
  },
  infoItem: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    gap: 8,
  },
  label: {
    height: 14,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    width: 100,
    marginBottom: 8,
  },
  value: {
    height: 16,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    width: '70%',
  },
});

