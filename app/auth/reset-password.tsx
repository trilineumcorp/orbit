import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { apiService } from '@/services/api';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token: string | string[] }>();
  const colorScheme = useColorScheme();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Extract token from params (handle both string and array)
  const token = Array.isArray(params.token) ? params.token[0] : params.token;

  useEffect(() => {
    console.log('Reset password screen loaded', { token, tokenType: typeof token, params });
    if (!token) {
      Alert.alert('Invalid Link', 'Password reset link is invalid or expired.', [
        { text: 'OK', onPress: () => router.replace('/auth/login') },
      ]);
    }
  }, [token]);

  const handleResetPassword = async () => {
    if (!token) {
      Alert.alert('Error', 'Invalid reset token');
      return;
    }

    if (!password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const resetToken = token?.trim();
      
      if (!resetToken) {
        Alert.alert('Error', 'Invalid reset token. Please use the link from your email.');
        setIsLoading(false);
        return;
      }

      console.log('Sending reset password request:', {
        hasToken: !!resetToken,
        tokenLength: resetToken?.length,
        tokenPrefix: resetToken?.substring(0, 10),
        hasPassword: !!password,
        passwordLength: password?.length,
      });

      const response = await apiService.post<{ message: string }>(
        '/auth/reset-password',
        {
          token: resetToken,
          password: password.trim(),
        },
        false // Don't require auth
      );

      console.log('Reset password response:', response);

      if (response.success) {
        Alert.alert('Success', 'Your password has been reset successfully!', [
          {
            text: 'OK',
            onPress: () => router.replace('/auth/login'),
          },
        ]);
      } else {
        Alert.alert('Error', response.message || 'Failed to reset password. Please try again.');
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      let errorMessage = 'Failed to reset password. The link may have expired.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isDark = colorScheme === 'dark';

  // Show error if no token after a brief delay (to allow params to load)
  const [showError, setShowError] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!token) {
        setShowError(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [token]);

  if (showError && !token) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ThemedView style={styles.container}>
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>Invalid Reset Link</ThemedText>
            <ThemedText style={[styles.errorText, { fontSize: 14, marginTop: 10, opacity: 0.7 }]}>
              The password reset link is invalid or expired. Please request a new one.
            </ThemedText>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.replace('/auth/login')}>
              <ThemedText style={styles.backButtonText}>Go to Login</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (!token) {
    // Show loading state while checking for token
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ThemedView style={styles.container}>
          <View style={[styles.errorContainer, { justifyContent: 'center' }]}>
            <ActivityIndicator size="large" color={ThemeColors.deepBlue} />
            <ThemedText style={[styles.errorText, { marginTop: 20 }]}>Loading...</ThemedText>
          </View>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ThemedView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <ThemedText style={styles.title}>Reset Password</ThemedText>
              <ThemedText style={styles.subtitle}>Enter your new password</ThemedText>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>New Password</ThemedText>
                <View style={styles.passwordInputWrapper}>
                  <View style={styles.inputIconContainer}>
                    <IconSymbol
                      name="lock.fill"
                      size={20}
                      color={isDark ? '#888' : ThemeColors.deepBlue}
                    />
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      styles.passwordInput,
                      styles.inputWithIcon,
                      isDark && styles.inputDark,
                    ]}
                    placeholder="Enter Your New Password"
                    placeholderTextColor={isDark ? '#888' : '#999'}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password-new"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <IconSymbol
                      name={showPassword ? 'eye.slash.fill' : 'eye.fill'}
                      size={20}
                      color={isDark ? '#AAA' : ThemeColors.deepBlue}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Confirm New Password</ThemedText>
                <View style={styles.passwordInputWrapper}>
                  <View style={styles.inputIconContainer}>
                    <IconSymbol
                      name="lock.fill"
                      size={20}
                      color={isDark ? '#888' : ThemeColors.deepBlue}
                    />
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      styles.passwordInput,
                      styles.inputWithIcon,
                      isDark && styles.inputDark,
                    ]}
                    placeholder="Confirm Your New Password"
                    placeholderTextColor={isDark ? '#888' : '#999'}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoComplete="password-new"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <IconSymbol
                      name={showConfirmPassword ? 'eye.slash.fill' : 'eye.fill'}
                      size={20}
                      color={isDark ? '#AAA' : ThemeColors.deepBlue}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleResetPassword}
                disabled={isLoading}>
                <LinearGradient
                  colors={[ThemeColors.deepBlue, ThemeColors.deepBlue + 'DD']}
                  style={styles.gradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}>
                  {isLoading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.resetButtonText}>Reset Password</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginLink}
                onPress={() => router.replace('/auth/login')}>
                <ThemedText style={styles.loginText}>
                  Remember your password?{' '}
                  <Text style={styles.loginLinkText}>Sign In</Text>
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIconContainer: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: 24,
    pointerEvents: 'none',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flex: 1,
  },
  inputWithIcon: {
    paddingLeft: 48,
  },
  inputDark: {
    backgroundColor: '#1A3D4D',
    borderColor: '#2A4D5D',
    color: '#FFF',
  },
  passwordInputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
    zIndex: 1,
  },
  resetButton: {
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
  },
  loginLinkText: {
    color: ThemeColors.orange,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: ThemeColors.deepBlue,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

