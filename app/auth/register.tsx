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
            <ThemedText style={styles.title}>Create Account</ThemedText>
            <ThemedText style={styles.subtitle}>Sign up to get started</ThemedText>
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
              <ThemedText style={styles.label}>Full Name</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  isDark && styles.inputDark,
                ]}
                placeholder="Enter your full name"
                placeholderTextColor={isDark ? '#888' : '#999'}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

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

            {userType === 'student' && (
              <>
                <View style={styles.inputContainer}>
                  <ThemedText style={styles.label}>Roll Number *</ThemedText>
                  <TextInput
                    style={[
                      styles.input,
                      isDark && styles.inputDark,
                    ]}
                    placeholder="Enter your roll number"
                    placeholderTextColor={isDark ? '#888' : '#999'}
                    value={rollNumber}
                    onChangeText={setRollNumber}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <ThemedText style={styles.label}>Class</ThemedText>
                  <TextInput
                    style={[
                      styles.input,
                      isDark && styles.inputDark,
                    ]}
                    placeholder="e.g., 12th, 11th"
                    placeholderTextColor={isDark ? '#888' : '#999'}
                    value={studentClass}
                    onChangeText={setStudentClass}
                  />
                </View>
              </>
            )}

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
              <ThemedText style={styles.label}>Confirm Password</ThemedText>
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
                  placeholder="Confirm Your Password"
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
              style={styles.registerButton}
              onPress={handleRegister}
              disabled={isLoading}>
              <LinearGradient
                colors={[ThemeColors.orange, '#FF8C5A']}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}>
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.registerButtonText}>Sign Up</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => router.back()}>
              <ThemedText style={styles.loginText}>
                Already have an account?{' '}
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
  registerButton: {
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonText: {
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
});

