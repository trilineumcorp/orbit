import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, useRef } from 'react';
import 'react-native-reanimated';

import { ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { initializeMockData } from '@/services/mockData';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CustomSplashScreen } from '@/components/splash-screen';

// Don't prevent auto-hide - we want to hide it immediately
// Hide native splash screen as early as possible
let splashHidden = false;
SplashScreen.hideAsync()
  .then(() => {
    splashHidden = true;
  })
  .catch(() => {
    splashHidden = true;
  });

const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: ThemeColors.orange,
    background: ThemeColors.lightNeutral,
    card: ThemeColors.white,
    text: ThemeColors.grayText,
    border: '#E0E0E0',
  },
};

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: ThemeColors.orange,
    background: ThemeColors.deepBlue,
    card: '#1A3D4D',
    text: ThemeColors.lightNeutral,
    border: '#2A4D5D',
  },
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationHandled = useRef(false);

  useEffect(() => {
    if (isLoading) {
      navigationHandled.current = false;
      return;
    }

    const inAuthGroup = segments[0] === 'auth';
    const pathname = segments.join('/');

    // Only handle navigation once per auth state change
    if (navigationHandled.current) {
      return;
    }

    // Don't redirect if we're already on the correct page
    // Allow reset-password page to be accessed without authentication
    if (pathname.includes('auth/reset-password')) {
      return; // Allow reset password page without redirect
    }
    if (pathname.includes('auth/login') && !isAuthenticated) {
      return; // Already on login page and not authenticated - correct state
    }

    // If authenticated and in auth group, redirect to home (but allow reset-password)
    if (isAuthenticated && inAuthGroup && user && !pathname.includes('auth/reset-password')) {
      navigationHandled.current = true;
      console.log('Root layout: Redirecting authenticated user from auth to home, role:', user.role);
      // Delay to ensure route groups are ready
      setTimeout(() => {
        // Navigate to root - route groups will handle showing the correct content
        router.replace('/');
      }, 500);
      return;
    }

    // If not authenticated and not in auth group, redirect to login
    if (!isAuthenticated && !inAuthGroup) {
      // Only redirect if we're sure - don't redirect if user exists (might be updating)
      if (!user) {
        navigationHandled.current = true;
        console.log('Root layout: Not authenticated and no user, redirecting to login');
        router.replace('/auth/login');
      }
      return;
    }

    // If authenticated and not in auth group, ensure we're showing the right route group
    if (isAuthenticated && !inAuthGroup && user) {
      console.log('Root layout: User authenticated, not in auth group, role:', user.role, 'pathname:', pathname);
      // The route groups should handle showing the correct content
      // If pathname is empty, we're at root - the route groups will match
      // Don't redirect - let the route groups handle showing the correct content
    }

    // Reset flag after a delay to allow for future navigation
    const timer = setTimeout(() => {
      navigationHandled.current = false;
    }, 2000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, segments, router, user]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? CustomDarkTheme : CustomLightTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(admin)" />
        <Stack.Screen name="(student)" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize mock data with timeout to prevent hanging
        const initPromise = initializeMockData();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Initialization timeout')), 5000)
        );
        
        await Promise.race([initPromise, timeoutPromise]).catch((e) => {
          console.warn('Mock data initialization warning:', e);
          // Continue even if mock data fails
        });
        
        // Add any other async initialization here (fonts, etc.)
        // await Font.loadAsync(...);
        
        // Add a small delay to ensure splash screen is visible
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn('Error during app initialization:', e);
        // Continue even if there's an error
      } finally {
        // Set app as ready - always set to true even if initialization fails
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // Show custom splash screen while app is loading
  if (!appIsReady) {
    return <CustomSplashScreen />; // Show custom splash screen
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
