import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Dimensions, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ThemeColors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

export default function StudentSettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={[styles.header, isDark && styles.headerDark]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
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

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Preferences Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Preferences</ThemedText>
            
            <View style={[styles.settingItem, isDark && styles.settingItemDark]}>
              <View style={styles.settingLeft}>
                <IconSymbol name="bell.fill" size={20} color={ThemeColors.orange} />
                <ThemedText style={styles.settingLabel}>Notifications</ThemedText>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#E0E0E0', true: ThemeColors.orange + '80' }}
                thumbColor={notificationsEnabled ? ThemeColors.orange : '#FFFFFF'}
              />
            </View>
          </View>

          {/* Account Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Account</ThemedText>
            
            <TouchableOpacity 
              style={[styles.settingItem, isDark && styles.settingItemDark]}
              onPress={() => router.push('/(student)/change-password')}>
              <View style={styles.settingLeft}>
                <IconSymbol name="lock.shield.fill" size={20} color={ThemeColors.orange} />
                <ThemedText style={styles.settingLabel}>Change Password</ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={18} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.settingItem, isDark && styles.settingItemDark]}
              onPress={() => router.push('/(student)/privacy')}>
              <View style={styles.settingLeft}>
                <IconSymbol name="person.fill" size={20} color={ThemeColors.deepBlue} />
                <ThemedText style={styles.settingLabel}>Privacy Settings</ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={18} color="#999" />
            </TouchableOpacity>
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>About</ThemedText>
            
            <View style={[styles.settingItem, isDark && styles.settingItemDark]}>
              <View style={styles.settingLeft}>
                <IconSymbol name="info.circle.fill" size={20} color={ThemeColors.deepBlue} />
                <ThemedText style={styles.settingLabel}>App Version</ThemedText>
              </View>
              <ThemedText style={styles.settingValue}>1.0.0</ThemedText>
            </View>
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
  },
  headerTitle: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    opacity: 0.7,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    marginBottom: 12,
  },
  settingItemDark: {
    backgroundColor: '#2A4D5D',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.7,
  },
});

