import React, { useState } from 'react';
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
  Dimensions,
  Animated as RNAnimated,
  Image,
  Keyboard,
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
import { BlurView } from 'expo-blur';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
  ZoomIn,
  SlideInRight,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { register, loginWithGoogle, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState('');
  const [userType, setUserType] = useState<'admin' | 'student'>('student');
  const [rollNumber, setRollNumber] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  
  // Animation values
  const buttonScale = new RNAnimated.Value(1);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !name.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
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

    if (userType === 'student' && !rollNumber.trim()) {
      Alert.alert('Error', 'Please enter your roll number');
      return;
    }

    try {
      await register(
        email,
        password,
        name,
        userType,
        userType === 'student'
          ? { rollNumber, class: studentClass }
          : undefined
      );
      Alert.alert('Success', 'Account created successfully!', [
        {
          text: 'OK',
          onPress: () => router.replace('/'),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Failed to create account');
    }
  };

  const handlePressIn = () => {
    RNAnimated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    RNAnimated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const checkPasswordStrength = (pass: string) => {
    let strength = 0;
    if (pass.length >= 6) strength++;
    if (pass.match(/[A-Z]/)) strength++;
    if (pass.match(/[0-9]/)) strength++;
    if (pass.match(/[^A-Za-z0-9]/)) strength++;
    setPasswordStrength(strength);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return '#E0E0E0';
    if (passwordStrength === 1) return '#FF6B6B';
    if (passwordStrength === 2) return '#FFA500';
    if (passwordStrength === 3) return '#4CAF50';
    return '#2E7D32';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return 'Weak';
    if (passwordStrength === 1) return 'Fair';
    if (passwordStrength === 2) return 'Good';
    if (passwordStrength === 3) return 'Strong';
    return 'Very Strong';
  };

  const isDark = colorScheme === 'dark';

  const getInputStyle = (inputName: string) => [
    styles.input,
    isDark && styles.inputDark,
    focusedInput === inputName && styles.inputFocused,
    isDark && focusedInput === inputName && styles.inputDarkFocused,
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ThemedView style={styles.container}>
        <LinearGradient
          colors={isDark ? ['#0A2A38', '#1A3D4D'] : ['#1E2F4410', '#2A426010']}
          style={StyleSheet.absoluteFill}
        />
        

        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}>
            
            <Animated.View 
              entering={FadeInUp.delay(200).duration(1000).springify()}
              style={styles.header}>
              <Animated.View 
                entering={ZoomIn.delay(400).duration(800)}
                style={styles.logoContainer}>
                <LinearGradient
                  colors={[ThemeColors.orange, '#2A4260', '#385579']}
                  style={styles.logoGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}>
                  <IconSymbol name="person.badge.plus" size={40} color="#FFF" />
                </LinearGradient>
              </Animated.View>
              <ThemedText style={styles.title}>Create Account</ThemedText>
              <ThemedText style={styles.subtitle}>Join us to start your journey</ThemedText>
            </Animated.View>

            <Animated.View 
              entering={FadeInDown.delay(600).duration(1000).springify()}
              style={styles.userTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  userType === 'student' && styles.userTypeButtonActive,
                ]}
                onPress={() => setUserType('student')}
                activeOpacity={0.8}>
                <IconSymbol
                  name="graduationcap.fill"
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
            </Animated.View>

            <Animated.View 
              entering={FadeInDown.delay(800).duration(1000)}
              style={styles.form}>
              
              <Animated.View entering={SlideInRight.delay(200).duration(600)}>
                <View style={styles.inputContainer}>
                  <ThemedText style={styles.label}>Full Name</ThemedText>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIconContainer}>
                      <IconSymbol
                        name="person.fill"
                        size={20}
                        color={focusedInput === 'name' 
                          ? ThemeColors.orange 
                          : isDark ? '#888' : ThemeColors.deepBlue}
                      />
                    </View>
                    <TextInput
                      style={getInputStyle('name')}
                      placeholder="Enter your full name"
                      placeholderTextColor={isDark ? '#888' : '#999'}
                      value={name}
                      onChangeText={setName}
                      onFocus={() => setFocusedInput('name')}
                      onBlur={() => setFocusedInput(null)}
                      autoCapitalize="words"
                    />
                  </View>
                </View>
              </Animated.View>

              <Animated.View entering={SlideInRight.delay(400).duration(600)}>
                <View style={styles.inputContainer}>
                  <ThemedText style={styles.label}>Email</ThemedText>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIconContainer}>
                      <IconSymbol
                        name="envelope.fill"
                        size={20}
                        color={focusedInput === 'email' 
                          ? ThemeColors.orange 
                          : isDark ? '#888' : ThemeColors.deepBlue}
                      />
                    </View>
                    <TextInput
                      style={getInputStyle('email')}
                      placeholder="Enter your email"
                      placeholderTextColor={isDark ? '#888' : '#999'}
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setFocusedInput('email')}
                      onBlur={() => setFocusedInput(null)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                    />
                  </View>
                </View>
              </Animated.View>

              {userType === 'student' && (
                <>
                  <Animated.View entering={SlideInRight.delay(600).duration(600)}>
                    <View style={styles.inputContainer}>
                      <ThemedText style={styles.label}>Roll Number <Text style={styles.requiredStar}>*</Text></ThemedText>
                      <View style={styles.inputWrapper}>
                        <View style={styles.inputIconContainer}>
                          <IconSymbol
                            name="number.circle.fill"
                            size={20}
                            color={focusedInput === 'rollNumber' 
                              ? ThemeColors.orange 
                              : isDark ? '#888' : ThemeColors.deepBlue}
                          />
                        </View>
                        <TextInput
                          style={getInputStyle('rollNumber')}
                          placeholder="Enter your roll number"
                          placeholderTextColor={isDark ? '#888' : '#999'}
                          value={rollNumber}
                          onChangeText={setRollNumber}
                          onFocus={() => setFocusedInput('rollNumber')}
                          onBlur={() => setFocusedInput(null)}
                          autoCapitalize="none"
                        />
                      </View>
                    </View>
                  </Animated.View>

                  <Animated.View entering={SlideInRight.delay(800).duration(600)}>
                    <View style={styles.inputContainer}>
                      <ThemedText style={styles.label}>Class</ThemedText>
                      <View style={styles.inputWrapper}>
                        <View style={styles.inputIconContainer}>
                          <IconSymbol
                            name="book.fill"
                            size={20}
                            color={focusedInput === 'class' 
                              ? ThemeColors.orange 
                              : isDark ? '#888' : ThemeColors.deepBlue}
                          />
                        </View>
                        <TextInput
                          style={getInputStyle('class')}
                          placeholder="e.g., 12th, 11th"
                          placeholderTextColor={isDark ? '#888' : '#999'}
                          value={studentClass}
                          onChangeText={setStudentClass}
                          onFocus={() => setFocusedInput('class')}
                          onBlur={() => setFocusedInput(null)}
                        />
                      </View>
                    </View>
                  </Animated.View>
                </>
              )}

              <Animated.View entering={SlideInRight.delay(1000).duration(600)}>
                <View style={styles.inputContainer}>
                  <ThemedText style={styles.label}>Password</ThemedText>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIconContainer}>
                      <IconSymbol
                        name="lock.fill"
                        size={20}
                        color={focusedInput === 'password' 
                          ? ThemeColors.orange 
                          : isDark ? '#888' : ThemeColors.deepBlue}
                      />
                    </View>
                    <TextInput
                      style={[getInputStyle('password'), styles.passwordInput]}
                      placeholder="Create a password"
                      placeholderTextColor={isDark ? '#888' : '#999'}
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        checkPasswordStrength(text);
                      }}
                      onFocus={() => setFocusedInput('password')}
                      onBlur={() => setFocusedInput(null)}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoComplete="password-new"
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                      activeOpacity={0.7}>
                      <IconSymbol
                        name={showPassword ? 'eye.slash.fill' : 'eye.fill'}
                        size={20}
                        color={isDark ? '#AAA' : ThemeColors.deepBlue}
                      />
                    </TouchableOpacity>
                  </View>
                  {password.length > 0 && (
                    <View style={styles.passwordStrengthContainer}>
                      <View style={styles.passwordStrengthBar}>
                        {[1, 2, 3, 4].map((index) => (
                          <View
                            key={index}
                            style={[
                              styles.strengthSegment,
                              {
                                backgroundColor: index <= passwordStrength 
                                  ? getPasswordStrengthColor() 
                                  : '#E0E0E0',
                              },
                            ]}
                          />
                        ))}
                      </View>
                      <Text style={[
                        styles.passwordStrengthText,
                        { color: getPasswordStrengthColor() }
                      ]}>
                        {getPasswordStrengthText()} password
                      </Text>
                    </View>
                  )}
                </View>
              </Animated.View>

              <Animated.View entering={SlideInRight.delay(1200).duration(600)}>
                <View style={styles.inputContainer}>
                  <ThemedText style={styles.label}>Confirm Password</ThemedText>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIconContainer}>
                      <IconSymbol
                        name="lock.fill"
                        size={20}
                        color={focusedInput === 'confirmPassword' 
                          ? ThemeColors.orange 
                          : isDark ? '#888' : ThemeColors.deepBlue}
                      />
                    </View>
                    <TextInput
                      style={[getInputStyle('confirmPassword'), styles.passwordInput]}
                      placeholder="Confirm your password"
                      placeholderTextColor={isDark ? '#888' : '#999'}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      onFocus={() => setFocusedInput('confirmPassword')}
                      onBlur={() => setFocusedInput(null)}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoComplete="password-new"
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      activeOpacity={0.7}>
                      <IconSymbol
                        name={showConfirmPassword ? 'eye.slash.fill' : 'eye.fill'}
                        size={20}
                        color={isDark ? '#AAA' : ThemeColors.deepBlue}
                      />
                    </TouchableOpacity>
                  </View>
                  {confirmPassword.length > 0 && password !== confirmPassword && (
                    <Text style={styles.passwordMismatchText}>
                      Passwords do not match
                    </Text>
                  )}
                </View>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(1400).duration(600)}>
                <TouchableOpacity
                  style={styles.registerButton}
                  onPress={handleRegister}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  disabled={isLoading}
                  activeOpacity={0.8}>
                  <RNAnimated.View style={{ transform: [{ scale: buttonScale }] }}>
                    <LinearGradient
                      colors={[ThemeColors.orange, '#2A4260']}
                      style={styles.gradientButton}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}>
                      {isLoading ? (
                        <ActivityIndicator color="#FFF" size="large" />
                      ) : (
                        <>
                          <Text style={styles.registerButtonText}>Sign Up</Text>
                          <IconSymbol name="arrow.right" size={20} color="#FFF" />
                        </>
                      )}
                    </LinearGradient>
                  </RNAnimated.View>
                </TouchableOpacity>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(1600).duration(600)}>
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <ThemedText style={styles.dividerText}>OR</ThemedText>
                  <View style={styles.dividerLine} />
                </View>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(1700).duration(600)}>
                <TouchableOpacity
                  style={styles.googleButton}
                  onPress={() => loginWithGoogle(userType)}
                  disabled={isLoading}
                  activeOpacity={0.8}>
                  <Image 
                    source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }} 
                    style={styles.googleIcon} 
                  />
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </TouchableOpacity>
              </Animated.View>

              <Animated.View entering={FadeInUp.delay(1800).duration(600)}>
                <TouchableOpacity
                  style={styles.loginLink}
                  onPress={() => router.back()}
                  activeOpacity={0.7}>
                  <ThemedText style={styles.loginText}>
                    Already have an account?{' '}
                    <Text style={styles.loginLinkText}>Sign In</Text>
                  </ThemedText>
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>
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
    position: 'relative',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },

  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 20,
    shadowColor: ThemeColors.orange,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  logoGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    letterSpacing: 0.3,
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
    gap: 18,
  },
  inputContainer: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.3,
  },
  requiredStar: {
    color: ThemeColors.orange,
    fontSize: 16,
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
    borderRadius: 18,
    padding: 16,
    paddingLeft: 48,
    fontSize: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    
  },
  inputFocused: {
    borderColor: ThemeColors.orange,
    backgroundColor: '#FFF',
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  inputDark: {
    backgroundColor: '#1E4A5A',
    color: '#FFF',
  },
  inputDarkFocused: {
    borderColor: ThemeColors.orange,
    backgroundColor: '#1E4A5A',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
    zIndex: 1,
  },
  passwordStrengthContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  passwordStrengthBar: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  strengthSegment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
  },
  passwordStrengthText: {
    fontSize: 12,
    fontWeight: '500',
  },
  passwordMismatchText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '500',
  },
  registerButton: {
    marginTop: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: ThemeColors.orange,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  gradientButton: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  registerButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    fontSize: 14,
    opacity: 0.6,
    fontWeight: '500',
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  loginText: {
    fontSize: 15,
  },
  loginLinkText: {
    color: ThemeColors.orange,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});