import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function CheckEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string | string[] }>();
  const colorScheme = useColorScheme();

  const email = Array.isArray(params.email) ? params.email[0] : params.email;

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
            <View style={styles.content}>
              {/* Icon */}
              <View style={styles.iconContainer}>
                <View style={[styles.iconCircle, isDark && styles.iconCircleDark]}>
                  <IconSymbol
                    name="envelope.fill"
                    size={48}
                    color={ThemeColors.orange}
                  />
                </View>
              </View>

              {/* Title */}
              <ThemedText style={styles.title}>Check Your Email</ThemedText>

              {/* Description */}
              <ThemedText style={styles.description}>
                We've sent a password reset link to
              </ThemedText>
              
              {email && (
                <ThemedText style={styles.emailText}>{email}</ThemedText>
              )}

              <ThemedText style={[styles.description, { marginTop: 20 }]}>
                Click the link in the email to reset your password. The link will expire in 1 hour.
              </ThemedText>

              {/* Instructions */}
              <View style={[styles.infoBox, isDark && styles.infoBoxDark]}>
                <ThemedText style={styles.infoTitle}>What to do next:</ThemedText>
                <View style={styles.infoItem}>
                  <Text style={styles.infoBullet}>1.</Text>
                  <ThemedText style={styles.infoText}>Open your email inbox</ThemedText>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoBullet}>2.</Text>
                  <ThemedText style={styles.infoText}>Click the "Reset Password" button in the email</ThemedText>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoBullet}>3.</Text>
                  <ThemedText style={styles.infoText}>Follow the instructions to set a new password</ThemedText>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => router.replace('/auth/login')}>
                  <LinearGradient
                    colors={[ThemeColors.deepBlue, ThemeColors.deepBlue + 'DD']}
                    style={styles.gradientButton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}>
                    <Text style={styles.backButtonText}>Back to Login</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={() => router.replace('/auth/login')}>
                  <ThemedText style={styles.resendButtonText}>Didn't receive email?</ThemedText>
                </TouchableOpacity>
              </View>
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
  content: {
    width: '100%',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 30,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: ThemeColors.orange,
  },
  iconCircleDark: {
    backgroundColor: '#1A3D4D',
    borderColor: ThemeColors.orange,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: ThemeColors.orange,
    marginBottom: 8,
  },
  infoBox: {
    marginTop: 30,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    width: '100%',
  },
  infoBoxDark: {
    backgroundColor: '#1A3D4D',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  infoBullet: {
    fontSize: 16,
    fontWeight: 'bold',
    color: ThemeColors.orange,
    marginRight: 12,
    minWidth: 20,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 40,
  },
  backButton: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 16,
  },
  resendButtonText: {
    fontSize: 14,
    color: ThemeColors.orange,
    fontWeight: '600',
  },
});