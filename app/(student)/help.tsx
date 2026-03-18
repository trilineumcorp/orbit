import React, { useEffect } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemeColors } from '@/constants/theme';
import { Platform, ScrollView, StyleSheet, View, Dimensions, TouchableOpacity, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;
const isDesktop = screenWidth >= 1024;

const getResponsiveValue = (small: number, medium: number, large: number) => {
  if (isDesktop) return large;
  if (isTablet) return medium;
  return small;
};

export default function HelpScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Handle Android back button
  useEffect(() => {
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        router.back();
        return true; // Prevent default behavior
      });

      return () => backHandler.remove();
    }
  }, [router]);

  const handleBack = () => {
    router.back();
  };

  const helpSections = [
    {
      title: 'Getting Started',
      icon: 'play.circle.fill',
      items: [
        'How to access videos and study materials',
        'How to take exams and view results',
        'How to use the OMR scanner',
      ],
    },
    {
      title: 'Account & Settings',
      icon: 'person.circle.fill',
      items: [
        'Update your profile information',
        'Change password',
        'Manage notifications',
      ],
    },
    {
      title: 'Troubleshooting',
      icon: 'wrench.and.screwdriver.fill',
      items: [
        'Video playback issues',
        'Exam submission problems',
        'OMR scanning errors',
      ],
    },
    {
      title: 'Contact Support',
      icon: 'envelope.fill',
      items: [
        'Email: support@topscore.com',
        'Phone: +91-XXXXX-XXXXX',
        'Available: Mon-Fri, 9 AM - 6 PM',
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ThemedView style={styles.container}>
        {/* Header with Back Button */}
        <View style={[styles.navHeader, isDark && styles.navHeaderDark]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}>
            <IconSymbol
              name="chevron.left"
              size={24}
              color={isDark ? ThemeColors.lightNeutral : ThemeColors.deepBlue}
            />
          </TouchableOpacity>
          <ThemedText style={styles.navHeaderTitle}>Help & Support</ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: ThemeColors.orange + '20' }]}>
              <IconSymbol name="info.circle.fill" size={48} color={ThemeColors.orange} />
            </View>
            <ThemedText type="title" style={styles.headerTitle}>
              Help & Support
            </ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Find answers to common questions and get assistance
            </ThemedText>
          </View>

        {helpSections.map((section, index) => {
          return (
            <View key={index} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconContainer, { backgroundColor: ThemeColors.deepBlue + '20' }]}>
                <IconSymbol name={section.icon as any} size={24} color={ThemeColors.deepBlue} />
              </View>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                {section.title}
              </ThemedText>
            </View>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <View key={itemIndex} style={styles.itemRow}>
                  <View style={styles.bullet} />
                  <ThemedText style={styles.itemText}>{item}</ThemedText>
                </View>
              ))}
            </View>
          </View>
          );
        })}

        <View style={styles.contactCard}>
          <ThemedText type="subtitle" style={styles.contactTitle}>
            Need More Help?
          </ThemedText>
          <ThemedText style={styles.contactText}>
            Our support team is here to assist you. Reach out through any of the channels above.
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
  navHeader: {
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
  navHeaderDark: {
    backgroundColor: '#1A3D4D',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  navHeaderTitle: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: getResponsiveValue(16, 20, 24, 28),
    paddingBottom: getResponsiveValue(100, 120, 140, 160),
  },
  header: {
    alignItems: 'center',
    marginBottom: getResponsiveValue(24, 28, 32, 36),
    paddingTop: getResponsiveValue(20, 24, 28, 32),
  },
  iconContainer: {
    width: getResponsiveValue(80, 96, 112, 128),
    height: getResponsiveValue(80, 96, 112, 128),
    borderRadius: getResponsiveValue(20, 24, 28, 32),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getResponsiveValue(16, 20, 24, 28),
  },
  headerTitle: {
    fontSize: getResponsiveValue(28, 32, 36, 40),
    fontWeight: '800',
    marginBottom: getResponsiveValue(8, 10, 12, 14),
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: getResponsiveValue(14, 16, 18, 20),
    opacity: 0.7,
    textAlign: 'center',
    paddingHorizontal: getResponsiveValue(20, 24, 28, 32),
  },
  section: {
    marginBottom: getResponsiveValue(24, 28, 32, 36),
    backgroundColor: ThemeColors.white,
    borderRadius: getResponsiveValue(16, 20, 24, 28),
    padding: getResponsiveValue(16, 20, 24, 28),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getResponsiveValue(16, 20, 24, 28),
    gap: getResponsiveValue(12, 14, 16, 18),
  },
  sectionIconContainer: {
    width: getResponsiveValue(40, 44, 48, 52),
    height: getResponsiveValue(40, 44, 48, 52),
    borderRadius: getResponsiveValue(12, 14, 16, 18),
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: getResponsiveValue(18, 20, 22, 24),
    fontWeight: '700',
  },
  sectionContent: {
    gap: getResponsiveValue(12, 14, 16, 18),
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: getResponsiveValue(12, 14, 16, 18),
  },
  bullet: {
    width: getResponsiveValue(6, 8, 10, 12),
    height: getResponsiveValue(6, 8, 10, 12),
    borderRadius: getResponsiveValue(3, 4, 5, 6),
    backgroundColor: ThemeColors.orange,
    marginTop: getResponsiveValue(6, 7, 8, 9),
  },
  itemText: {
    flex: 1,
    fontSize: getResponsiveValue(14, 16, 18, 20),
    lineHeight: getResponsiveValue(20, 24, 28, 32),
    opacity: 0.8,
  },
  contactCard: {
    backgroundColor: ThemeColors.orange + '15',
    borderRadius: getResponsiveValue(16, 20, 24, 28),
    padding: getResponsiveValue(20, 24, 28, 32),
    marginTop: getResponsiveValue(8, 10, 12, 14),
    borderWidth: 1,
    borderColor: ThemeColors.orange + '30',
  },
  contactTitle: {
    fontSize: getResponsiveValue(18, 20, 22, 24),
    fontWeight: '700',
    marginBottom: getResponsiveValue(8, 10, 12, 14),
    color: ThemeColors.orange,
  },
  contactText: {
    fontSize: getResponsiveValue(14, 16, 18, 20),
    lineHeight: getResponsiveValue(20, 24, 28, 32),
    opacity: 0.8,
  },
});

