import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Dimensions, ScrollView, Alert, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ThemeColors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/avatar';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;
const isDesktop = screenWidth >= 1024;

interface ProfileMenuOption {
  id: string;
  label: string;
  icon: string;
  onPress: () => void;
  destructive?: boolean;
}

export default function ProfileMenuScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Handle Android back button
  useEffect(() => {
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        router.back();
        return true; // Prevent default behavior
      });

      return () => backHandler.remove();
    }
  }, [router]);

  const handleBack = () => {
    router.back();
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const handleChangeAvatar = () => {
    Alert.alert(
      'Change Avatar',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Take Photo',
          onPress: () => {
            // TODO: Implement camera functionality
            Alert.alert('Coming Soon', 'Camera functionality will be available soon.');
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: () => {
            // TODO: Implement image picker functionality
            Alert.alert('Coming Soon', 'Gallery picker will be available soon.');
          },
        },
      ]
    );
  };

  const menuOptions: ProfileMenuOption[] = [
    {
      id: 'profile',
      label: 'My Profile',
      icon: 'person.fill',
      onPress: () => {
        if (user?.role === 'student') {
          router.push('/(student)/profile');
        } else {
          router.push('/(admin)/profile');
        }
      },
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'gearshape.fill',
      onPress: () => {
        if (user?.role === 'student') {
          router.push('/(student)/settings');
        } else {
          router.push('/(admin)/settings');
        }
      },
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: 'questionmark.circle.fill',
      onPress: () => {
        if (user?.role === 'student') {
          router.push('/(student)/help');
        } else {
          router.push('/(admin)/support');
        }
      },
    },
    {
      id: 'about',
      label: 'About',
      icon: 'info.circle.fill',
      onPress: () => {
        if (user?.role === 'student') {
          router.push('/(student)/about');
        } else {
          // Admin about can be added later
          Alert.alert('About', 'About section coming soon for admin users.');
        }
      },
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={[styles.header, isDark && styles.headerDark]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}>
            <IconSymbol
              name="chevron.left"
              size={24}
              color={isDark ? ThemeColors.lightNeutral : ThemeColors.deepBlue}
            />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Account</ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* User Info Header */}
          <View style={[styles.userInfoHeader, isDark && styles.userInfoHeaderDark]}>
            <TouchableOpacity
              onPress={handleChangeAvatar}
              style={styles.userIconContainer}
              activeOpacity={0.8}>
              <Avatar
                name={user?.name}
                email={user?.email}
                avatarUrl={user?.avatarUrl}
                size="large"
                showBorder={true}
                borderColor={ThemeColors.orange}
              />
              <View style={styles.editAvatarBadge}>
                <IconSymbol name="camera.fill" size={isTablet ? 16 : 14} color="#FFF" />
              </View>
            </TouchableOpacity>
            <View style={styles.userInfo}>
              <ThemedText
                style={[
                  styles.userName,
                  {
                    fontSize: isTablet ? 24 : 20,
                  },
                ]}>
                {user?.name || 'User'}
              </ThemedText>
              <ThemedText
                style={[
                  styles.userEmail,
                  {
                    fontSize: isTablet ? 16 : 14,
                    opacity: 0.7,
                  },
                ]}>
                {user?.email || ''}
              </ThemedText>
              {user?.role && (
                <View style={styles.roleBadge}>
                  <ThemedText style={styles.roleText}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>

          {/* Menu Options */}
          <View style={styles.menuOptions}>
            {menuOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.menuItem, isDark && styles.menuItemDark]}
                onPress={option.onPress}
                activeOpacity={0.7}>
                <View style={[styles.menuIconContainer, isDark && styles.menuIconContainerDark]}>
                  <IconSymbol
                    name={option.icon as any}
                    size={isTablet ? 24 : 22}
                    color={ThemeColors.grayText}
                  />
                </View>
                <ThemedText style={styles.menuLabel}>
                  {option.label}
                </ThemedText>
                <IconSymbol
                  name="chevron.right"
                  size={isTablet ? 20 : 18}
                  color="#6E6E73"
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout Button */}
          <View style={styles.logoutSection}>
            <TouchableOpacity
              style={[styles.logoutButton, isDark && styles.logoutButtonDark]}
              onPress={handleLogout}
              activeOpacity={0.7}>
              <View style={styles.logoutIconContainer}>
                <IconSymbol
                  name="arrow.right.square.fill"
                  size={isTablet ? 24 : 22}
                  color={ThemeColors.orange}
                />
              </View>
              <ThemedText style={styles.logoutText}>Logout</ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? (isTablet ? 20 : 16) : (isTablet ? 16 : 12),
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerDark: {
    backgroundColor: '#1A3D4D',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: isTablet ? 24 : 20,
  },
  userInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: isTablet ? 24 : 20,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    marginBottom: isTablet ? 24 : 20,
    gap: isTablet ? 20 : 16,
  },
  userInfoHeaderDark: {
    backgroundColor: '#2A4D5D',
  },
  userIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: isTablet ? 32 : 28,
    height: isTablet ? 32 : 28,
    borderRadius: isTablet ? 16 : 14,
    backgroundColor: ThemeColors.orange,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
    gap: 6,
  },
  userName: {
    fontWeight: '700',
  },
  userEmail: {
    fontWeight: '500',
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: isTablet ? 12 : 10,
    paddingVertical: isTablet ? 6 : 5,
    borderRadius: isTablet ? 14 : 12,
    marginTop: 4,
    backgroundColor: ThemeColors.orange + '20',
  },
  roleText: {
    fontWeight: '700',
    textTransform: 'capitalize',
    color: ThemeColors.orange,
    fontSize: isTablet ? 14 : 12,
  },
  menuOptions: {
    gap: isTablet ? 12 : 8,
    marginBottom: isTablet ? 24 : 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: isTablet ? 24 : 20,
    paddingVertical: isTablet ? 18 : 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    gap: isTablet ? 16 : 14,
  },
  menuItemDark: {
    backgroundColor: '#2A4D5D',
  },
  menuIconContainer: {
    width: isTablet ? 44 : 40,
    height: isTablet ? 44 : 40,
    borderRadius: isTablet ? 14 : 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  menuIconContainerDark: {
    backgroundColor: '#1A3D4D',
  },
  menuLabel: {
    flex: 1,
    fontWeight: '600',
    fontSize: isTablet ? 18 : 16,
  },
  logoutSection: {
    marginTop: isTablet ? 8 : 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: isTablet ? 24 : 20,
    paddingVertical: isTablet ? 18 : 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    gap: isTablet ? 16 : 14,
  },
  logoutButtonDark: {
    backgroundColor: '#2A4D5D',
  },
  logoutIconContainer: {
    width: isTablet ? 44 : 40,
    height: isTablet ? 44 : 40,
    borderRadius: isTablet ? 14 : 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ThemeColors.orange + '20',
  },
  logoutText: {
    flex: 1,
    fontWeight: '600',
    color: ThemeColors.orange,
    fontSize: isTablet ? 18 : 16,
  },
});

