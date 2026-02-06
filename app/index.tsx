import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeColors } from '@/constants/theme';

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    // Small delay to ensure everything is ready
    const timer = setTimeout(() => {
      // If not authenticated, redirect to login
      if (!isAuthenticated || !user) {
        console.log('Root index: Not authenticated, redirecting to login');
        router.replace('/auth/login');
        return;
      }

      console.log('Root index: User authenticated, role:', user.role);
      
      // Redirect based on role
      if (user.role === 'student') {
        console.log('Root index: Redirecting student to student route group');
        router.replace('/(student)/');
      } else if (user.role === 'admin') {
        console.log('Root index: Redirecting admin to admin route group');
        router.replace('/(admin)/');
      } else {
        // Unknown role, redirect to login
        router.replace('/auth/login');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={ThemeColors.orange} />
      </View>
    );
  }

  // Show loading while redirecting
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={ThemeColors.orange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

