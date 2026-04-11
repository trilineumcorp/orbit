import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
  useWindowDimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;
const isTablet = screenWidth >= 768;
const isDesktop = screenWidth >= 1024;

interface Activity {
  id: string;
  title: string;
  fileName: string;
  description: string;
  grade: string;
}

const activities: Activity[] = [
  {
    id: 'air-water',
    title: 'Air & Water Activities',
    fileName: 'Grade5_Air_Water_Activities.html',
    description: 'Learn about air and water through interactive activities',
    grade: 'Grade 5',
  },
  {
    id: 'fractions',
    title: 'Fractions Activities',
    fileName: 'fractions-grade5.html',
    description: 'Master fractions with fun exercises',
    grade: 'Grade 5',
  },
  {
    id: 'plants',
    title: 'Plants Activities',
    fileName: 'plants-grade4.html',
    description: 'Explore plant life and biology',
    grade: 'Grade 4',
  },
  {
    id: 'tenali-lsrw',
    title: 'Tenali Rama - LSRW',
    fileName: 'tenali-lsrw-grade5.html',
    description: 'Language skills with Tenali Rama stories',
    grade: 'Grade 5',
  },
  {
    id: 'kabir-dohe',
    title: 'Kabir Dohe Activities',
    fileName: 'kabir_dohe_activities.html',
    description: 'Learn Hindi poetry through Kabir Dohe',
    grade: 'Grade 5',
  },
  {
    id: 'mass-weight',
    title: 'Mass, Weight & Volume',
    fileName: 'grade5_mass_weight_volume_activities.html',
    description: 'Understand measurements and physical properties',
    grade: 'Grade 5',
  },
];

export default function ActivitiesScreen() {
  const colorScheme = useColorScheme();
  useWindowDimensions();
  const router = useRouter();

  const colors = Colors[colorScheme ?? 'light'];
  const androidStatusBarOffset = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

  const handleActivityPress = (activity: Activity) => {
    router.push({
      pathname: '/(student)/activities/[id]',
      params: {
        id: activity.id,
        title: activity.title,
        fileName: activity.fileName,
        description: activity.description,
        grade: activity.grade,
      },
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: androidStatusBarOffset }]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <IconSymbol name="chevron.left" size={24} color={colors.text} />
          </TouchableOpacity>

          <ThemedText style={styles.headerTitle}>Activities</ThemedText>

          <View style={styles.headerRightSpace} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <ThemedText style={styles.sectionDescription}>
            Engage with interactive learning activities tailored to your grade level. Tap any
            activity to browse and open it.
          </ThemedText>

          <View style={styles.activitiesGrid}>
            {activities.map((activity) => (
              <TouchableOpacity
                key={activity.id}
                style={[styles.activityCard, styles.cardShadow]}
                onPress={() => handleActivityPress(activity)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.activityIconContainer,
                    { backgroundColor: ThemeColors.orange + '15' },
                  ]}
                >
                  <IconSymbol name="book.fill" size={28} color={ThemeColors.orange} />
                </View>

                <View style={styles.activityContent}>
                  <ThemedText style={[styles.activityTitle, { color: ThemeColors.deepBlue }]}>
                    {activity.title}
                  </ThemedText>

                  <ThemedText
                    style={[styles.activityDescription, { color: ThemeColors.grayText }]}
                  >
                    {activity.description}
                  </ThemedText>

                  <View style={styles.gradeTag}>
                    <ThemedText style={styles.gradeText}>{activity.grade}</ThemedText>
                  </View>
                </View>

                <IconSymbol name="chevron.right" size={20} color={ThemeColors.grayText} />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.infoBox}>
            <IconSymbol name="info.circle.fill" size={20} color={ThemeColors.orange} />
            <ThemedText style={[styles.infoText, { color: ThemeColors.grayText }]}>
              Tap on any activity to open its related output screen.
            </ThemedText>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const getResponsiveValue = (
  small: number,
  medium: number,
  large: number,
  xlarge?: number
) => {
  if (isDesktop && xlarge !== undefined) return xlarge;
  if (isTablet) return large;
  if (isSmallScreen) return small;
  return medium;
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ThemeColors.lightNeutral,
  },
  container: {
    flex: 1,
    backgroundColor: ThemeColors.lightNeutral,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getResponsiveValue(16, 20, 24, 28),
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: ThemeColors.white,
  },
  headerTitle: {
    fontSize: getResponsiveValue(20, 22, 24, 26),
    fontWeight: '600',
  },
  headerRightSpace: {
    width: 24,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: getResponsiveValue(16, 20, 24, 28),
    paddingVertical: 20,
    paddingBottom: 120,
  },
  sectionDescription: {
    fontSize: getResponsiveValue(14, 15, 16, 17),
    color: ThemeColors.grayText,
    marginBottom: 20,
    lineHeight: 22,
  },
  activitiesGrid: {
    gap: 12,
    marginBottom: 20,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: ThemeColors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: getResponsiveValue(15, 16, 17, 18),
    fontWeight: '600',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: getResponsiveValue(13, 14, 14, 15),
    marginBottom: 8,
    lineHeight: 20,
  },
  gradeTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: ThemeColors.orange + '15',
    borderRadius: 6,
  },
  gradeText: {
    fontSize: 12,
    color: ThemeColors.orange,
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    padding: 14,
    backgroundColor: ThemeColors.orange + '10',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: ThemeColors.orange,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});