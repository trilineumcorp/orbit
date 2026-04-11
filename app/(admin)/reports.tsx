import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ThemeColors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getPlatformAnalytics,
  getTopContent,
  getSubjectAnalytics,
} from '@/services/adminApi';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

export default function AdminReportsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [platform, setPlatform] = useState<unknown>(null);
  const [topContent, setTopContent] = useState<unknown>(null);
  const [subjects, setSubjects] = useState<unknown>(null);

  const load = async () => {
    try {
      const [p, t, s] = await Promise.all([
        getPlatformAnalytics(),
        getTopContent(12),
        getSubjectAnalytics(),
      ]);
      setPlatform(p);
      setTopContent(t);
      setSubjects(s);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [])
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ThemedView style={styles.container}>
        <View style={[styles.header, isDark && styles.headerDark]}>
          <TouchableOpacity
            onPress={() => router.push('/(admin)/')}
            style={styles.backButton}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <IconSymbol name="chevron.left" size={24} color={isDark ? ThemeColors.lightNeutral : ThemeColors.deepBlue} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Analytics</ThemedText>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}>
          {loading ? (
            <ActivityIndicator size="large" color={ThemeColors.orange} style={{ marginTop: 40 }} />
          ) : (
            <>
              <ThemedText style={styles.sectionTitle}>Platform (last 30 days)</ThemedText>
              <ThemedView style={[styles.card, isDark && styles.cardDark]}>
                <ThemedText style={styles.mono}>
                  {platform != null ? JSON.stringify(platform, null, 2) : 'No data'}
                </ThemedText>
              </ThemedView>

              <ThemedText style={styles.sectionTitle}>Top content</ThemedText>
              <ThemedView style={[styles.card, isDark && styles.cardDark]}>
                <ThemedText style={styles.mono}>
                  {topContent != null ? JSON.stringify(topContent, null, 2) : 'No data'}
                </ThemedText>
              </ThemedView>

              <ThemedText style={styles.sectionTitle}>By subject</ThemedText>
              <ThemedView style={[styles.card, isDark && styles.cardDark]}>
                <ThemedText style={styles.mono}>
                  {subjects != null ? JSON.stringify(subjects, null, 2) : 'No data'}
                </ThemedText>
              </ThemedView>
            </>
          )}
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  headerDark: {
    borderBottomColor: '#2A4D5D',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 8,
  },
  card: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    marginBottom: 16,
  },
  cardDark: {
    backgroundColor: '#1A3D4D',
  },
  mono: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
