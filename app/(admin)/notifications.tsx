import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ThemeColors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
}

export default function AdminNotificationsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New Student Registered',
      message: 'A new student has registered in the system',
      time: '2 hours ago',
      type: 'info',
      read: false,
    },
    {
      id: '2',
      title: 'Exam Completed',
      message: '5 students have completed the Mathematics exam',
      time: '5 hours ago',
      type: 'success',
      read: false,
    },
    {
      id: '3',
      title: 'System Update',
      message: 'New features have been added to the platform',
      time: '1 day ago',
      type: 'info',
      read: true,
    },
    {
      id: '4',
      title: 'Content Uploaded',
      message: 'New video content has been uploaded',
      time: '2 days ago',
      type: 'success',
      read: true,
    },
  ]);

  const isDark = colorScheme === 'dark';

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return 'checkmark.circle.fill';
      case 'warning':
        return 'exclamationmark.triangle.fill';
      case 'error':
        return 'xmark.circle.fill';
      default:
        return 'info.circle.fill';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'warning':
        return '#FF9800';
      case 'error':
        return '#F44336';
      default:
        return ThemeColors.deepBlue;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
          <ThemedText style={styles.headerTitle}>Notifications</ThemedText>
          {unreadCount > 0 ? (
            <TouchableOpacity
              style={styles.markAllButton}
              onPress={markAllAsRead}
              activeOpacity={0.7}>
              <ThemedText style={styles.markAllText}>Mark all read</ThemedText>
            </TouchableOpacity>
          ) : (
            <View style={styles.markAllButton} />
          )}
        </View>

        {unreadCount > 0 && (
          <View style={[styles.badge, isDark && styles.badgeDark]}>
            <ThemedText style={styles.badgeText}>
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </ThemedText>
          </View>
        )}

        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.notificationItem,
                !item.read && styles.unreadItem,
                isDark && styles.notificationItemDark,
              ]}
              onPress={() => markAsRead(item.id)}
              activeOpacity={0.7}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: getNotificationColor(item.type) + '20' },
                ]}>
                <IconSymbol
                  name={getNotificationIcon(item.type) as any}
                  size={24}
                  color={getNotificationColor(item.type)}
                />
              </View>
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <ThemedText style={styles.notificationTitle}>
                    {item.title}
                  </ThemedText>
                  {!item.read && <View style={styles.unreadDot} />}
                </View>
                <ThemedText style={styles.notificationMessage}>
                  {item.message}
                </ThemedText>
                <ThemedText style={styles.notificationTime}>
                  {item.time}
                </ThemedText>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <IconSymbol
                name="bell.slash.fill"
                size={48}
                color={isDark ? '#666' : '#999'}
              />
              <ThemedText style={styles.emptyText}>
                No notifications
              </ThemedText>
            </View>
          }
        />
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
  markAllButton: {
    width: 100,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  markAllText: {
    color: ThemeColors.orange,
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#FFF3E0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  badgeDark: {
    backgroundColor: '#2A4D5D',
  },
  badgeText: {
    color: ThemeColors.orange,
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  notificationItemDark: {
    backgroundColor: '#1A3D4D',
    borderColor: '#2A4D5D',
  },
  unreadItem: {
    backgroundColor: '#F0F7FF',
    borderColor: ThemeColors.deepBlue,
    borderWidth: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ThemeColors.orange,
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
    marginTop: 16,
  },
});

