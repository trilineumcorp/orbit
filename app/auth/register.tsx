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
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function RegisterScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { register, isLoading } = useAuth();
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
          colors={isDark ? ['#0A2A38', '#1A3D4D'] : ['#FF8C5A20', '#FFB34720']}
          style={StyleSheet.absoluteFill}
        />
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            
            <Animated.View 
              entering={FadeInUp.delay(200).duration(1000)}
              style={styles.header}>
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={[ThemeColors.orange, '#FF8C5A']}
                  style={styles.logoGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}>
                  <IconSymbol name="person.badge.plus" size={40} color="#FFF" />
                </LinearGradient>
              </View>
              <ThemedText style={styles.title}>Create Account</ThemedText>
              <ThemedText style={styles.subtitle}>Join us to start your journey</ThemedText>
            </Animated.View>

            <Animated.View 
              entering={FadeInDown.delay(400).duration(1000)}
              style={styles.userTypeContainer}>
              <BlurView intensity={isDark ? 20 : 80} style={styles.userTypeBlur}>
                <View style={styles.userTypeWrapper}>
                  <TouchableOpacity
                    style={[
                      styles.userTypeButton,
                      userType === 'student' && styles.userTypeButtonActive,
                    ]}
                    onPress={() => setUserType('student')}
                    activeOpacity={0.7}>
                    <LinearGradient
                      colors={userType === 'student' 
                        ? [ThemeColors.orange, '#FF8C5A']
                        : ['transparent', 'transparent']}
                      style={styles.userTypeGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}>
                      <IconSymbol 
                        name="graduationcap.fill" 
                        size={20} 
                        color={userType === 'student' ? '#FFF' : isDark ? '#AAA' : '#666'} 
                      />
                      <ThemedText
                        style={[
                          styles.userTypeText,
                          userType === 'student' && styles.userTypeTextActive,
                        ]}>
                        Student
                      </ThemedText>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.userTypeButton,
                      userType === 'admin' && styles.userTypeButtonActive,
                    ]}
                    onPress={() => setUserType('admin')}
                    activeOpacity={0.7}>
                    <LinearGradient
                      colors={userType === 'admin'
                        ? [ThemeColors.orange, '#FF8C5A']
                        : ['transparent', 'transparent']}
                      style={styles.userTypeGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}>
                      <IconSymbol 
                        name="shield.fill" 
                        size={20} 
                        color={userType === 'admin' ? '#FFF' : isDark ? '#AAA' : '#666'} 
                      />
                      <ThemedText
                        style={[
                          styles.userTypeText,
                          userType === 'admin' && styles.userTypeTextActive,
                        ]}>
                        Admin
                      </ThemedText>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </Animated.View>

            <Animated.View 
              entering={FadeInDown.delay(600).duration(1000)}
              style={styles.form}>
              
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

              {userType === 'student' && (
                <>
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
                </>
              )}

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
                    onChangeText={setPassword}
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
              </View>

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
              </View>

              <TouchableOpacity
                style={styles.registerButton}
                onPress={handleRegister}
                disabled={isLoading}
                activeOpacity={0.8}>
                <LinearGradient
                  colors={[ThemeColors.orange, '#FF8C5A']}
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
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <ThemedText style={styles.dividerText}>OR</ThemedText>
                <View style={styles.dividerLine} />
              </View>

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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  userTypeContainer: {
    marginBottom: 30,
    borderRadius: 16,
    overflow: 'hidden',
  },
  userTypeBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  userTypeWrapper: {
    flexDirection: 'row',
    padding: 4,
  },
  userTypeButton: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 12,
  },
  userTypeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
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
    gap: 16,
  },
  inputContainer: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  requiredStar: {
    color: ThemeColors.orange,
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
    borderRadius: 16,
    padding: 16,
    paddingLeft: 48,
    fontSize: 16,
    borderWidth: 1.5,
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
    shadowOpacity: 0.1,
  },
  inputDark: {
    backgroundColor: '#1A3D4D',
    color: '#FFF',
  },
  inputDarkFocused: {
    borderColor: ThemeColors.orange,
    backgroundColor: '#1A3D4D',
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
  registerButton: {
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: ThemeColors.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  gradientButton: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  registerButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    fontSize: 14,
    opacity: 0.5,
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  loginText: {
    fontSize: 15,
  },
  loginLinkText: {
    color: ThemeColors.orange,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});