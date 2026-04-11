import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
  Dimensions,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ThemeColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '@/services/api';
import { ErrorBoundary } from '@/components/error-boundary';

const { width, height } = Dimensions.get('window');
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
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Log when component mounts
  useEffect(() => {
    console.log('LoginScreen: Component mounted');
    startAnimations();
  }, []);

  // Load remembered email on mount
  useEffect(() => {
    loadRememberedEmail();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

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
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Login screen: Redirecting to home, user role:', loggedInUser.role);
      
      // Redirect to root
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
        false
      );

      if (response.success) {
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
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <LinearGradient
          colors={isDark ? ['#0A1A2A', '#0F2A3A'] : ['#667eea', '#764ba2']}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <BlurView
            intensity={isDark ? 20 : 40}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
          <ThemedView style={[styles.container, isDark && styles.containerDark]}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardView}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
              <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
                
                <Animated.View 
                  style={[
                    styles.header,
                    {
                      opacity: fadeAnim,
                      transform: [{ translateY: slideAnim }]
                    }
                  ]}>
                  <View style={styles.logoContainer}>
                    <LinearGradient
                      colors={[ThemeColors.orange, '#2A4260']}
                      style={styles.logoGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}>
                      <IconSymbol name="graduationcap.fill" size={40} color="#FFF" />
                    </LinearGradient>
                  </View>
                  <ThemedText style={styles.title}>Welcome Back</ThemedText>
                  <ThemedText style={styles.subtitle}>Sign in to continue your journey</ThemedText>
                </Animated.View>

                <Animated.View 
                  style={[
                    styles.formContainer,
                    {
                      opacity: fadeAnim,
                      transform: [{ scale: scaleAnim }]
                    }
                  ]}>
                  <View style={styles.userTypeContainer}>
                    <TouchableOpacity
                      style={[
                        styles.userTypeButton,
                        userType === 'student' && styles.userTypeButtonActive,
                      ]}
                      onPress={() => setUserType('student')}
                      activeOpacity={0.8}>
                      <IconSymbol
                        name="person.fill"
                        size={18}
                        color={userType === 'student' ? '#FFF' : '#666'}
                        style={styles.userTypeIcon}
                      />
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
                      onPress={() => setUserType('admin')}
                      activeOpacity={0.8}>
                      <IconSymbol
                        name="shield.fill"
                        size={18}
                        color={userType === 'admin' ? '#FFF' : '#666'}
                        style={styles.userTypeIcon}
                      />
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
                      <ThemedText style={styles.label}>Email Address</ThemedText>
                      <View style={styles.inputWrapper}>
                        <View style={styles.inputIconContainer}>
                          <IconSymbol
                            name="envelope.fill"
                            size={20}
                            color={isDark ? '#AAA' : ThemeColors.deepBlue}
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
                            color={isDark ? '#AAA' : ThemeColors.deepBlue}
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
                      disabled={isLoading}
                      activeOpacity={0.9}>
                      <LinearGradient
                        colors={[ThemeColors.orange, '#2A4260']}
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
                      onPress={() => router.push('/auth/register')}
                      activeOpacity={0.7}>
                      <ThemedText style={styles.registerText}>
                        Don't have an account?{' '}
                        <Text style={styles.registerLinkText}>Sign Up</Text>
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              </ScrollView>
            </KeyboardAvoidingView>
          </ThemedView>
        </LinearGradient>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  containerDark: {
    backgroundColor: 'rgba(10, 26, 42, 0.95)',
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
  logoContainer: {
    marginBottom: 24,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  userTypeContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  userTypeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  userTypeButtonActive: {
    backgroundColor: ThemeColors.orange,
    shadowColor: ThemeColors.orange,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  userTypeIcon: {
    marginRight: 4,
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
    marginLeft: 4,
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
  backgroundColor: '#F8F9FA',
  borderRadius: 16,
  padding: 16,
  fontSize: 16,
  borderWidth: 1,
  borderColor: '#E9ECEF',
  flex: 1,
  },
  inputWithIcon: {
    paddingLeft: 48,
  },
  inputDark: {
    backgroundColor: '#1E2A3A',
    borderColor: '#2A3A4A',
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
    marginBottom: 24,
    marginTop: 8,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
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
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: ThemeColors.orange,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
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
    padding: 10,
  },
  registerText: {
    fontSize: 14,
    opacity: 0.8,
  },
  registerLinkText: {
    fontWeight: 'bold',
    color: ThemeColors.orange,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },

});