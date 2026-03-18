import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ThemeColors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ListSkeleton } from '@/components/skeleton';
import { detectNetworkSpeed, getMinLoadingTime } from '@/utils/network';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'exam' | 'video' | 'general';
}

export default function StudentNotificationsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      let minLoadingTime = 300; // Default minimum loading time
      
      try {
        const networkSpeed = await detectNetworkSpeed();
        minLoadingTime = getMinLoadingTime(networkSpeed);
      } catch (networkError) {
        console.warn('Network speed detection failed, using default:', networkError);
      }
      
      // Simulate loading notifications
      await new Promise(resolve => setTimeout(resolve, minLoadingTime));
      
      setNotifications([
    {
      id: '1',
      title: 'New Exam Available',
      message: 'A new practice exam has been added to your course',
      time: '2 hours ago',
      read: false,
      type: 'exam',
    },
    {
      id: '2',
      title: 'Video Lecture Updated',
      message: 'New video content has been added to Physics course',
      time: '1 day ago',
      read: false,
      type: 'video',
    },
    {
      id: '3',
      title: 'Welcome to topscore',
        message: 'Thank you for joining our platform. Start exploring!',
        time: '3 days ago',
        read: true,
        type: 'general',
      },
    ]);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'exam':
        return 'doc.text.fill';
      case 'video':
        return 'play.rectangle.fill';
      default:
        return 'bell.fill';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'exam':
        return ThemeColors.orange;
      case 'video':
        return ThemeColors.deepBlue;
      default:
        return ThemeColors.orange;
    }
  };

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
          <ThemedText style={styles.headerTitle}>Notifications</ThemedText>
          <TouchableOpacity style={styles.markAllButton}>
            <ThemedText style={styles.markAllText}>Mark all read</ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {loading ? (
            <ListSkeleton count={5} itemHeight={100} />
          ) : notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="bell.slash.fill" size={64} color={ThemeColors.orange} />
              <ThemedText style={styles.emptyText}>No notifications</ThemedText>
              <ThemedText style={styles.emptySubtext}>You're all caught up!</ThemedText>
            </View>
          ) : (
            notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationItem,
                  isDark && styles.notificationItemDark,
                  !notification.read && styles.unreadNotification,
                ]}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: getNotificationColor(notification.type) + '20' },
                  ]}>
                  <IconSymbol
                    name={getNotificationIcon(notification.type) as any}
                    size={24}
                    color={getNotificationColor(notification.type)}
                  />
                </View>
                <View style={styles.notificationContent}>
                  <ThemedText style={styles.notificationTitle}>{notification.title}</ThemedText>
                  <ThemedText style={styles.notificationMessage}>{notification.message}</ThemedText>
                  <ThemedText style={styles.notificationTime}>{notification.time}</ThemedText>
                </View>
                {!notification.read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            ))
          )}
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
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markAllText: {
    color: ThemeColors.orange,
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  notificationItemDark: {
    backgroundColor: '#2A4D5D',
  },
  unreadNotification: {
    backgroundColor: ThemeColors.orange + '10',
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
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    opacity: 0.6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ThemeColors.orange,
    marginTop: 4,
  },
});

