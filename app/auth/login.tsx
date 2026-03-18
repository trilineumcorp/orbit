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
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ThemeColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '@/services/api';
import { ErrorBoundary } from '@/components/error-boundary';

const REMEMBER_ME_KEY = 'remember_me';
const REMEMBERED_EMAIL_KEY = 'remembered_email';

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { login, isLoading, user, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [userType, setUserType] = useState<'admin' | 'student'>('student');

  // Log when component mounts
  useEffect(() => {
    console.log('LoginScreen: Component mounted');
  }, []);

  // Load remembered email on mount
  useEffect(() => {
    loadRememberedEmail();
  }, []);

  const loadRememberedEmail = async () => {
    try {
      const remembered = await AsyncStorage.getItem(REMEMBER_ME_KEY);
      if (remembered === 'true') {
        const rememberedEmail = await AsyncStorage.getItem(REMEMBERED_EMAIL_KEY);
        if (rememberedEmail) {
          setEmail(rememberedEmail);
          setRememberMe(true);
        }
      }
    } catch (error) {
      console.error('Error loading remembered email:', error);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      console.log('Login screen: Attempting login with email:', email.trim());
      const loggedInUser = await login(email.trim(), password);
      console.log('Login screen: Login successful, user:', loggedInUser);
      
      // Handle remember me
      if (rememberMe) {
        await AsyncStorage.setItem(REMEMBER_ME_KEY, 'true');
        await AsyncStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim());
      } else {
        await AsyncStorage.removeItem(REMEMBER_ME_KEY);
        await AsyncStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }
      
      // Wait for auth state to fully propagate in context
      // The auth context sets the user, so we need to wait for that
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Login screen: Redirecting to home, user role:', loggedInUser.role);
      
      // Redirect to root - the root index will redirect to the correct route group based on role
      router.replace('/');
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error.message || 'Invalid email or password. Please try again.');
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your email address first');
      return;
    }

    try {
      const response = await apiService.post<{ message: string }>(
        '/auth/forgot-password',
        { email: email.trim() },
        false // Don't require auth
      );

      if (response.success) {
        // Navigate to check email screen
        router.push({
          pathname: '/auth/check-email',
          params: { email: email.trim() },
        });
      } else {
        Alert.alert('Error', response.message || 'Failed to send password reset link. Please try again.');
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      Alert.alert('Error', error.message || 'Failed to send password reset link. Please check your connection and try again.');
    }
  };

  const isDark = colorScheme === 'dark';

  return (
    <ErrorBoundary>
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
            <ThemedText style={styles.title}>Welcome Back</ThemedText>
            <ThemedText style={styles.subtitle}>Sign in to continue</ThemedText>
          </View>

          <View style={styles.userTypeContainer}>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === 'student' && styles.userTypeButtonActive,
              ]}
              onPress={() => setUserType('student')}>
              <ThemedText
                style={[
                  styles.userTypeText,
                  userType === 'student' && styles.userTypeTextActive,
                ]}>
                Student
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === 'admin' && styles.userTypeButtonActive,
              ]}
              onPress={() => setUserType('admin')}>
              <ThemedText
                style={[
                  styles.userTypeText,
                  userType === 'admin' && styles.userTypeTextActive,
                ]}>
                Admin
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Email</ThemedText>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIconContainer}>
                  <IconSymbol
                    name="envelope.fill"
                    size={20}
                    color={isDark ? '#888' : ThemeColors.deepBlue}
                  />
                </View>
                <TextInput
                  style={[
                    styles.input,
                    styles.inputWithIcon,
                    isDark && styles.inputDark,
                  ]}
                  placeholder="Enter Your Email"
                  placeholderTextColor={isDark ? '#888' : '#999'}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Password</ThemedText>
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
                  placeholder="Enter Your Password"
                  placeholderTextColor={isDark ? '#888' : '#999'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
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

            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.rememberMeContainer}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}>
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && (
                    <IconSymbol
                      name="checkmark"
                      size={14}
                      color="#FFF"
                    />
                  )}
                </View>
                <ThemedText style={styles.rememberMeText}>Remember me</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleForgotPassword}
                activeOpacity={0.7}>
                <ThemedText style={styles.forgotPasswordText}>Forgot Password?</ThemedText>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading}>
              <LinearGradient
                colors={[ThemeColors.orange, '#FF8C5A']}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}>
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.loginButtonText}>Sign In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => router.push('/auth/register')}>
              <ThemedText style={styles.registerText}>
                Don't have an account?{' '}
                <Text style={styles.registerLinkText}>Sign Up</Text>
              </ThemedText>
            </TouchableOpacity>
          </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ThemedView>
    </SafeAreaView>
    </ErrorBoundary>
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
  userTypeContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 4,
  },
  userTypeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  userTypeButtonActive: {
    backgroundColor: ThemeColors.orange,
  },
  userTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  userTypeTextActive: {
    color: '#FFF',
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
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: ThemeColors.deepBlue,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: ThemeColors.deepBlue,
    borderColor: ThemeColors.deepBlue,
  },
  rememberMeText: {
    fontSize: 14,
    color: ThemeColors.deepBlue,
    fontWeight: '500',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: ThemeColors.orange,
    fontWeight: '600',
  },
  loginButton: {
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
  },
  registerLinkText: {
    color: ThemeColors.orange,
    fontWeight: '600',
  },
});

