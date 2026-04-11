import { Stack, useGlobalSearchParams, usePathname, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

export default function AuthLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useGlobalSearchParams();

  // Email clients often turn links into .../reset-password/?token=... which does not match Expo web routes.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (pathname !== '/auth/reset-password/') return;
    const token = Array.isArray(params.token) ? params.token[0] : params.token;
    if (typeof token === 'string' && token.length > 0) {
      router.replace(`/auth/reset-password?token=${encodeURIComponent(token)}`);
    } else {
      router.replace('/auth/reset-password');
    }
  }, [pathname, params, router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'card',
      }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="check-email" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}

