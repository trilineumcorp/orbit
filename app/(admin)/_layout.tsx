import { Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function AdminLayout() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Small delay to allow auth state to propagate after login
    const checkAuth = setTimeout(() => {
      if (!isAuthenticated) {
        router.replace('/auth/login');
      } else if (user?.role !== 'admin') {
        // If user is authenticated but not admin, redirect to their appropriate route
        // This ensures only admins can access admin routes
        router.replace('/auth/login');
      }
    }, 100);

    return () => clearTimeout(checkAuth);
  }, [isLoading, isAuthenticated, user, router]);

  const handleLogout = async () => {
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <View style={styles.layoutContainer}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="students" />
        <Stack.Screen name="exams" />
        <Stack.Screen name="content" />
        <Stack.Screen name="reports" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="support" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="moderation" options={{ presentation: 'card', headerShown: false }} />
        <Stack.Screen name="bulk-operations" options={{ presentation: 'card', headerShown: false }} />
        <Stack.Screen name="system-settings" options={{ presentation: 'card', headerShown: false }} />
        <Stack.Screen name="gamification-tools" options={{ presentation: 'card', headerShown: false }} />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  layoutContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    marginRight: 16,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});