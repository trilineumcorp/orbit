import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeColors } from '@/constants/theme';
import { ErrorBoundary } from '@/components/error-boundary';

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      console.log('Root index: Safety timeout - redirecting to login');
      router.replace('/auth/login');
    }, 2000);

    if (isLoading) {
      return () => clearTimeout(safetyTimeout);
    }

    clearTimeout(safetyTimeout);

    const navigate = () => {
      try {
        if (!isAuthenticated || !user) {
          console.log('Root index: Not authenticated, redirecting to login');
          router.replace('/auth/login');
        } else {
          console.log('Root index: User authenticated, role:', user.role);
          if (user.role === 'student') {
            router.replace('/(student)/');
          } else if (user.role === 'admin') {
            router.replace('/(admin)/');
          } else {
            router.replace('/auth/login');
          }
        }
      } catch (error) {
        console.error('Navigation error:', error);
        router.replace('/auth/login');
      }
    };

    const timer = setTimeout(navigate, 50);

    return () => {
      clearTimeout(safetyTimeout);
      clearTimeout(timer);
    };
  }, [isLoading, isAuthenticated, user, router]);

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <ActivityIndicator size="large" color={ThemeColors.orange} />
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});