import { Image } from 'expo-image';
import { View, StyleSheet, Text, Platform, Dimensions } from 'react-native';
import { ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;
const isDesktop = screenWidth >= 1024;

interface AvatarProps {
  name?: string;
  email?: string;
  avatarUrl?: string | null;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  showBorder?: boolean;
  borderColor?: string;
}

const sizeMap = {
  small: isTablet ? 32 : 28,
  medium: isTablet ? 48 : 40,
  large: isTablet ? 64 : 56,
  xlarge: isTablet ? 80 : 72,
};

export function Avatar({
  name,
  email,
  avatarUrl,
  size = 'medium',
  showBorder = false,
  borderColor,
}: AvatarProps) {
  const colorScheme = useColorScheme();
  const avatarSize = sizeMap[size];
  const fontSize = size === 'small' ? (isTablet ? 12 : 10) : size === 'medium' ? (isTablet ? 16 : 14) : size === 'large' ? (isTablet ? 24 : 20) : (isTablet ? 32 : 28);

  // Get initials from name or email
  const getInitials = (): string => {
    if (name) {
      const names = name.trim().split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  // Generate a color based on name/email for consistent avatar colors
  const getAvatarColor = (): string => {
    const text = name || email || 'user';
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  const backgroundColor = getAvatarColor();
  const initials = getInitials();
  const border = showBorder ? 2 : 0;
  const borderColorValue = borderColor || ThemeColors.orange;

  return (
    <View
      style={[
        styles.container,
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
          backgroundColor: avatarUrl ? 'transparent' : backgroundColor,
          borderWidth: border,
          borderColor: borderColorValue,
        },
      ]}>
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          style={[
            styles.image,
            {
              width: avatarSize - border * 2,
              height: avatarSize - border * 2,
              borderRadius: (avatarSize - border * 2) / 2,
            },
          ]}
          contentFit="cover"
          placeholderContentFit="cover"
          transition={200}
        />
      ) : (
        <Text
          style={[
            styles.initials,
            {
              fontSize,
              color: '#FFFFFF',
            },
          ]}>
          {initials}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    fontWeight: '700',
    textAlign: 'center',
  },
});

