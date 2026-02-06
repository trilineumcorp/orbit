import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Dimensions, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ThemeColors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Image } from 'expo-image';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

export default function StudentAboutScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={[styles.header, isDark && styles.headerDark]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <IconSymbol
              name="chevron.left"
              size={24}
              color={isDark ? ThemeColors.lightNeutral : ThemeColors.deepBlue}
            />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>About</ThemedText>
          <View style={styles.backButton} />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* App Logo and Info */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/images/viswasnav.png')}
                style={styles.logo}
                contentFit="contain"
              />
            </View>
            <ThemedText style={styles.appName}>VISHWAS EDUTECH</ThemedText>
            <ThemedText style={styles.appTagline}>IIT FOUNDATION | MEDICAL</ThemedText>
            <ThemedText style={styles.version}>Version 1.0.0</ThemedText>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <ThemedText style={styles.description}>
              VISHWAS EDUTECH is a comprehensive educational platform designed to help students excel
              in their IIT Foundation and Medical entrance exam preparation. Our platform provides
              access to video lectures, study materials, practice exams, and comprehensive learning
              resources.
            </ThemedText>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Contact Us</ThemedText>
            
            <TouchableOpacity
              style={[styles.contactItem, isDark && styles.contactItemDark]}
              onPress={() => Linking.openURL('mailto:support@viswas.com')}>
              <IconSymbol name="envelope.fill" size={20} color={ThemeColors.orange} />
              <ThemedText style={styles.contactText}>support@viswas.com</ThemedText>
              <IconSymbol name="chevron.right" size={18} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contactItem, isDark && styles.contactItemDark]}
              onPress={() => Linking.openURL('tel:+1234567890')}>
              <IconSymbol name="phone.fill" size={20} color={ThemeColors.deepBlue} />
              <ThemedText style={styles.contactText}>+1 (234) 567-890</ThemedText>
              <IconSymbol name="chevron.right" size={18} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Legal */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Legal</ThemedText>
            
            <TouchableOpacity style={[styles.legalItem, isDark && styles.legalItemDark]}>
              <View style={styles.legalItemLeft}>
                <IconSymbol name="doc.text.fill" size={20} color={ThemeColors.orange} />
                <ThemedText style={styles.legalText}>Terms of Service</ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={18} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.legalItem, isDark && styles.legalItemDark]}
              onPress={() => router.push('/(student)/privacy')}>
              <View style={styles.legalItemLeft}>
                <IconSymbol name="hand.raised.fill" size={20} color={ThemeColors.deepBlue} />
                <ThemedText style={styles.legalText}>Privacy Policy</ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={18} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Copyright */}
          <View style={styles.copyrightSection}>
            <ThemedText style={styles.copyrightText}>
              © 2024 VISHWAS EDUTECH. All rights reserved.
            </ThemedText>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
    color: ThemeColors.deepBlue,
  },
  appTagline: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: ThemeColors.orange,
  },
  version: {
    fontSize: 12,
    opacity: 0.6,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    opacity: 0.7,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    opacity: 0.8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    marginBottom: 12,
    gap: 12,
  },
  contactItemDark: {
    backgroundColor: '#2A4D5D',
  },
  contactText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    marginBottom: 12,
  },
  legalItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  legalItemDark: {
    backgroundColor: '#2A4D5D',
  },
  legalText: {
    fontSize: 16,
    fontWeight: '500',
  },
  copyrightSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  copyrightText: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
  },
});

