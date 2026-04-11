import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'react-native-reanimated';

// Initialize React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes cache
    },
  },
});

import { ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { initializeMockData } from '@/services/mockData';
import { AuthProvider } from '@/contexts/AuthContext';
import { CustomSplashScreen } from '@/components/splash-screen';
import { ErrorBoundary } from '@/components/error-boundary';

// Prevent auto-hide so we can control when to hide it
SplashScreen.preventAutoHideAsync().catch(() => {});

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

  // Simplified - let index.tsx handle navigation
  // This component just provides the navigation structure

  return (
    <ThemeProvider value={colorScheme === 'dark' ? CustomDarkTheme : CustomLightTheme}>
      <ErrorBoundary>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(admin)" />
          <Stack.Screen name="(student)" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
      </ErrorBoundary>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);

  useEffect(() => {
    // Hide native splash screen immediately to show custom splash
    SplashScreen.hideAsync().catch(() => {});
    
    // Safety timeout - always show app after 3 seconds max
    const safetyTimeout = setTimeout(() => {
      console.log('RootLayout: Safety timeout - forcing app ready');
      setAppIsReady(true);
    }, 3000);

    async function prepare() {
      try {
        // Optional local seed for offline demos only — keep off when using real API data
        if (process.env.EXPO_PUBLIC_ENABLE_MOCK_SEED === 'true') {
          initializeMockData().catch((e) => {
            console.warn('Mock data initialization warning:', e);
          });
        }
        
        // Show splash screen for at least 2.5 seconds so users can see it
        await new Promise(resolve => setTimeout(resolve, 2500));
      } catch (e) {
        console.error('Error during app initialization:', e);
        setInitError(e as Error);
        // Continue even if there's an error
      } finally {
        // Clear safety timeout since we're ready
        clearTimeout(safetyTimeout);
        // Ensure native splash screen is hidden
        SplashScreen.hideAsync().catch(() => {});
        // Set app as ready - always set to true even if initialization fails
        console.log('RootLayout: App ready, showing main app');
        setAppIsReady(true);
      }
    }

    prepare();

    return () => {
      clearTimeout(safetyTimeout);
    };
  }, []);

  // Ensure splash screen is definitely hidden when app becomes ready
  // This must be before any conditional returns to follow Rules of Hooks
  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [appIsReady]);

  // If there was an initialization error, still show the app
  if (initError) {
    console.warn('App initialized with error, but continuing:', initError);
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AuthProvider>
          <ErrorBoundary>
            {!appIsReady ? (
              <CustomSplashScreen />
            ) : (
              <RootLayoutNav />
            )}
          </ErrorBoundary>
        </AuthProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}