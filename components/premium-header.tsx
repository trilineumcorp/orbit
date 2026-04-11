import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemeColors } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';

interface PremiumHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightAction?: {
    icon: string;
    onPress: () => void;
  };
  rightComponent?: React.ReactNode;
}

export function PremiumHeader({ title, subtitle, showBackButton, onBackPress, rightAction, rightComponent }: PremiumHeaderProps) {
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <LinearGradient
      colors={[ThemeColors.deepBlue, '#0A2E3D']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}>
      <View style={styles.headerContent}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            activeOpacity={0.7}>
            <View style={styles.backButtonContainer}>
              <IconSymbol name="chevron.left" size={24} color={ThemeColors.lightNeutral} />
            </View>
          </TouchableOpacity>
        )}
        <View style={[styles.titleContainer, showBackButton && styles.titleContainerWithBack]}>
          <ThemedText type="title" style={[styles.headerTitle, { color: ThemeColors.lightNeutral }]}>
            {title}
          </ThemedText>
          {subtitle && (
            <ThemedText style={[styles.headerSubtitle, { color: ThemeColors.lightNeutral }]}>
              {subtitle}
            </ThemedText>
          )}
        </View>
        {rightComponent ? (
          rightComponent
        ) : rightAction ? (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={rightAction.onPress}
            activeOpacity={0.7}>
            <View style={styles.actionButtonContainer}>
              <IconSymbol name={rightAction.icon as any} size={32} color={ThemeColors.orange} />
            </View>
          </TouchableOpacity>
        ) : null}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ThemeColors.orange + '20',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  titleContainer: {
    flex: 1,
  },
  titleContainerWithBack: {
    marginLeft: 0,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    opacity: 0.95,
    fontWeight: '500',
  },
  actionButton: {
    padding: 4,
  },
  actionButtonContainer: {
    ...Platform.select({
      ios: {
        shadowColor: ThemeColors.orange,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});

