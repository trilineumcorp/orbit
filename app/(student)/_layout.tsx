import { Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemeColors } from '@/constants/theme';
import { BottomNavbar } from '@/components/bottom-navbar';

export default function StudentLayout() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't check auth while loading - wait for auth state to be ready
    if (isLoading) {
      console.log('Student layout: Still loading auth state');
      return;
    }

    // Use a delay to ensure auth state has fully propagated after login
    const checkAuth = setTimeout(() => {
      console.log('Student layout auth check - isAuthenticated:', isAuthenticated, 'user:', user, 'role:', user?.role);
      
      // Only redirect if we're absolutely sure the user is not a student
      if (!user) {
        // No user at all - redirect to login
        console.log('Student layout: No user, redirecting to login');
        router.replace('/auth/login');
      } else if (user.role !== 'student') {
        // User exists but is not a student - redirect to login
        // The root index will handle redirecting them to the correct route group
        console.log('Student layout: User is not a student, redirecting to login. Role:', user.role);
        router.replace('/auth/login');
      } else {
        // User is a student - allow access
        console.log('Student layout: Student authenticated successfully, role:', user.role);
      }
    }, 500); // Reduced delay since root index handles initial routing

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

  // Show loading while auth state is being determined
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // If no user and not authenticated, show loading (will redirect via useEffect)
  if (!user && !isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Only render if user is a student
  // If user exists but is not a student, return null (admin layout will handle it)
  if (user && user.role !== 'student') {
    console.log('Student layout: Not rendering - user is not a student, role:', user.role);
    return null;
  }

  // If we reach here, user exists and is a student (or user exists and we're waiting for auth state)
  // Allow rendering - the useEffect will handle redirects if needed
  console.log('Student layout: Rendering - user:', user?.email, 'role:', user?.role, 'isAuthenticated:', isAuthenticated);

  return (
    <View style={styles.layoutContainer}>
      <Stack
        screenOptions={{
          headerShown: false, // Hide header - using bottom nav instead
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="explore" />
        <Stack.Screen name="videos" />
        <Stack.Screen name="flipbooks" />
        <Stack.Screen name="exams" />
        <Stack.Screen name="doubts" />
        <Stack.Screen name="reports" />
        <Stack.Screen name="omr-scanner" />
        <Stack.Screen name="help" />
        <Stack.Screen
          name="profile-menu"
          options={{
            presentation: 'card',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            presentation: 'card',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            presentation: 'card',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="about"
          options={{
            presentation: 'card',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="change-password"
          options={{
            presentation: 'card',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="privacy"
          options={{
            presentation: 'card',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="exam-create"
          options={{ 
            presentation: 'card', 
            headerShown: true,
            title: 'Create Exam',
            headerBackVisible: true,
          }}
        />
        <Stack.Screen
          name="exam-take"
          options={{ presentation: 'card', headerShown: false }}
        />
        <Stack.Screen
          name="flipbook-viewer"
          options={{ presentation: 'card', headerShown: false }}
        />
        <Stack.Screen
          name="video-player"
          options={{ presentation: 'card', headerShown: false }}
        />
        <Stack.Screen
          name="omr-result"
          options={{ presentation: 'card', headerShown: false }}
        />
      </Stack>
      <BottomNavbar role="student" />
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
