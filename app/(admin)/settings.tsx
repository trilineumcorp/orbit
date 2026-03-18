import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ThemeColors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/AuthContext';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

interface SettingItem {
  id: string;
  title: string;
  description?: string;
  icon: string;
  type: 'toggle' | 'navigation' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export default function AdminSettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(colorScheme === 'dark');

  const isDark = colorScheme === 'dark';

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const settingsGroups: { title: string; items: SettingItem[] }[] = [
    {
      title: 'Preferences',
      items: [
        {
          id: 'notifications',
          title: 'Push Notifications',
          description: 'Receive push notifications',
          icon: 'bell.fill',
          type: 'toggle',
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
        {
          id: 'email',
          title: 'Email Notifications',
          description: 'Receive email notifications',
          icon: 'envelope.fill',
          type: 'toggle',
          value: emailNotifications,
          onToggle: setEmailNotifications,
        },
        {
          id: 'darkmode',
          title: 'Dark Mode',
          description: 'Enable dark mode',
          icon: 'moon.fill',
          type: 'toggle',
          value: darkMode,
          onToggle: setDarkMode,
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          id: 'profile',
          title: 'Edit Profile',
          description: 'Update your profile information',
          icon: 'person.fill',
          type: 'navigation',
          onPress: () => router.push('/(admin)/profile'),
        },
        {
          id: 'password',
          title: 'Change Password',
          description: 'Update your password',
          icon: 'lock.fill',
          type: 'navigation',
          onPress: () => {
            Alert.alert('Change Password', 'Password change feature coming soon!');
          },
        },
        {
          id: 'privacy',
          title: 'Privacy Settings',
          description: 'Manage your privacy',
          icon: 'hand.raised.fill',
          type: 'navigation',
          onPress: () => {
            Alert.alert('Privacy', 'Privacy settings coming soon!');
          },
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          id: 'version',
          title: 'App Version',
          description: '1.0.0',
          icon: 'info.circle.fill',
          type: 'action',
          onPress: () => {
            Alert.alert('App Version', 'topscore v1.0.0');
          },
        },
        {
          id: 'terms',
          title: 'Terms of Service',
          icon: 'doc.text.fill',
          type: 'action',
          onPress: () => {
            Alert.alert('Terms of Service', 'Terms of service coming soon!');
          },
        },
        {
          id: 'privacy-policy',
          title: 'Privacy Policy',
          icon: 'lock.shield.fill',
          type: 'action',
          onPress: () => {
            Alert.alert('Privacy Policy', 'Privacy policy coming soon!');
          },
        },
      ],
    },
    {
      title: 'Actions',
      items: [
        {
          id: 'logout',
          title: 'Logout',
          icon: 'arrow.right.square.fill',
          type: 'action',
          onPress: handleLogout,
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.settingItem, isDark && styles.settingItemDark]}
        onPress={() => {
          if (item.type === 'navigation' || item.type === 'action') {
            item.onPress?.();
          }
        }}
        disabled={item.type === 'toggle'}
        activeOpacity={0.7}>
        <View style={styles.settingLeft}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: ThemeColors.orange + '20' },
            ]}>
            <IconSymbol
              name={item.icon as any}
              size={20}
              color={ThemeColors.orange}
            />
          </View>
          <View style={styles.settingText}>
            <ThemedText style={styles.settingTitle}>{item.title}</ThemedText>
            {item.description && (
              <ThemedText style={styles.settingDescription}>
                {item.description}
              </ThemedText>
            )}
          </View>
        </View>
        {item.type === 'toggle' && (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: '#767577', true: ThemeColors.orange }}
            thumbColor={Platform.OS === 'android' ? '#f4f3f4' : undefined}
          />
        )}
        {(item.type === 'navigation' || item.type === 'action') && (
          <IconSymbol
            name="chevron.right"
            size={20}
            color={isDark ? '#888' : '#999'}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={[styles.header, isDark && styles.headerDark]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push('/(admin)/')}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <IconSymbol
              name="chevron.left"
              size={24}
              color={isDark ? ThemeColors.lightNeutral : ThemeColors.deepBlue}
            />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Settings</ThemedText>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {settingsGroups.map((group, groupIndex) => (
            <View key={groupIndex} style={styles.settingsGroup}>
              <ThemedText style={styles.groupTitle}>{group.title}</ThemedText>
              <View style={[styles.settingsList, isDark && styles.settingsListDark]}>
                {group.items.map(renderSettingItem)}
              </View>
            </View>
          ))}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
    borderBottomColor: '#2A4D5D',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  settingsGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.6,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  settingsListDark: {
    backgroundColor: '#1A3D4D',
    borderColor: '#2A4D5D',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingItemDark: {
    borderBottomColor: '#2A4D5D',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    opacity: 0.6,
  },
});

