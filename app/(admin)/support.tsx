import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Dimensions,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ThemeColors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

interface SupportOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
}

export default function AdminSupportScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const isDark = colorScheme === 'dark';

  const supportOptions: SupportOption[] = [
    {
      id: 'email',
      title: 'Email Support',
      description: 'Send us an email and we\'ll get back to you',
      icon: 'envelope.fill',
      action: () => {
        Linking.openURL('mailto:support@vishwas.com?subject=Support Request');
      },
    },
    {
      id: 'phone',
      title: 'Phone Support',
      description: 'Call us for immediate assistance',
      icon: 'phone.fill',
      action: () => {
        Linking.openURL('tel:+1234567890');
      },
    },
    {
      id: 'chat',
      title: 'Live Chat',
      description: 'Chat with our support team',
      icon: 'message.fill',
      action: () => {
        Alert.alert('Live Chat', 'Live chat feature coming soon!');
      },
    },
    {
      id: 'faq',
      title: 'FAQ',
      description: 'Browse frequently asked questions',
      icon: 'questionmark.circle.fill',
      action: () => {
        Alert.alert('FAQ', 'FAQ section coming soon!');
      },
    },
  ];

  const handleSubmit = () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Here you would send the support request to your backend
    Alert.alert(
      'Success',
      'Your support request has been submitted. We will get back to you soon.',
      [
        {
          text: 'OK',
          onPress: () => {
            setSubject('');
            setMessage('');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={[styles.header, isDark && styles.headerDark]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push('/(admin)/')}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <IconSymbol
              name="chevron.left"
              size={24}
              color={isDark ? ThemeColors.lightNeutral : ThemeColors.deepBlue}
            />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Customer Support</ThemedText>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Support Options */}
          <View style={styles.optionsSection}>
            <ThemedText style={styles.sectionTitle}>Get Help</ThemedText>
            <View style={styles.optionsGrid}>
              {supportOptions.map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.optionCard, isDark && styles.optionCardDark]}
                  onPress={option.action}
                  activeOpacity={0.7}>
                  <View
                    style={[
                      styles.optionIconContainer,
                      { backgroundColor: ThemeColors.orange + '20' },
                    ]}>
                    <IconSymbol
                      name={option.icon as any}
                      size={28}
                      color={ThemeColors.orange}
                    />
                  </View>
                  <ThemedText style={styles.optionTitle}>
                    {option.title}
                  </ThemedText>
                  <ThemedText style={styles.optionDescription}>
                    {option.description}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Contact Form */}
          <View style={styles.formSection}>
            <ThemedText style={styles.sectionTitle}>Send us a Message</ThemedText>
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Subject</ThemedText>
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  value={subject}
                  onChangeText={setSubject}
                  placeholder="Enter subject"
                  placeholderTextColor={isDark ? '#888' : '#999'}
                />
              </View>

              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Message</ThemedText>
                <TextInput
                  style={[
                    styles.textArea,
                    isDark && styles.inputDark,
                  ]}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Enter your message"
                  placeholderTextColor={isDark ? '#888' : '#999'}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}>
                <LinearGradient
                  colors={[ThemeColors.deepBlue, ThemeColors.deepBlue + 'DD']}
                  style={styles.gradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}>
                  <Text style={styles.submitButtonText}>Send Message</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? (isTablet ? 20 : 16) : (isTablet ? 16 : 12),
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerDark: {
    backgroundColor: '#1A3D4D',
    borderBottomColor: '#2A4D5D',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  optionsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    width: isTablet ? '48%' : '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  optionCardDark: {
    backgroundColor: '#1A3D4D',
    borderColor: '#2A4D5D',
  },
  optionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  formSection: {
    marginTop: 20,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputDark: {
    backgroundColor: '#2A4D5D',
    borderColor: '#3A5D6D',
    color: '#FFF',
  },
  textArea: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 120,
  },
  submitButton: {
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

