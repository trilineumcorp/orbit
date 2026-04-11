import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/AuthContext';
import { PremiumHeader } from '@/components/premium-header';
import { getGamificationProfile, getLeaderboard, getUserBadges } from '@/services/gamification';

export default function GamificationScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [badges, setBadges] = useState<unknown>(null);
  const [leaderboard, setLeaderboard] = useState<unknown[]>([]);

  const load = async () => {
    if (!user?.id) return;
    try {
      const [p, b, l] = await Promise.all([
        getGamificationProfile(user.id),
        getUserBadges(user.id),
        getLeaderboard('all-time', 30),
      ]);
      setProfile((p as Record<string, unknown>) ?? null);
      setBadges(b);
      const rankings =
        l && typeof l === 'object' && l !== null && 'rankings' in l
          ? (l as { rankings: unknown[] }).rankings
          : Array.isArray(l)
            ? l
            : [];
      setLeaderboard(rankings);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [user?.id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <PremiumHeader title="Points & Leaderboard" showBackButton />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {loading ? (
          <ActivityIndicator size="large" color={ThemeColors.orange} style={{ marginTop: 40 }} />
        ) : (
          <>
            <ThemedView style={[styles.card, isDark && styles.cardDark]}>
              <ThemedText style={styles.h2}>Your progress</ThemedText>
              <ThemedText style={styles.mono}>
                {profile ? JSON.stringify(profile, null, 2) : 'No profile data yet.'}
              </ThemedText>
            </ThemedView>
            <ThemedView style={[styles.card, isDark && styles.cardDark]}>
              <ThemedText style={styles.h2}>Badges</ThemedText>
              <ThemedText style={styles.mono}>
                {badges ? JSON.stringify(badges, null, 2) : 'No badges yet — keep learning!'}
              </ThemedText>
            </ThemedView>
            <ThemedView style={[styles.card, isDark && styles.cardDark]}>
              <ThemedText style={styles.h2}>Leaderboard</ThemedText>
              {leaderboard.length === 0 ? (
                <ThemedText style={styles.muted}>No entries yet.</ThemedText>
              ) : (
                leaderboard.slice(0, 15).map((row: any, i: number) => (
                  <View key={i} style={styles.row}>
                    <ThemedText style={styles.rank}>#{i + 1}</ThemedText>
                    <ThemedText style={styles.rowText} numberOfLines={1}>
                      {typeof row === 'object' && row !== null
                        ? row.userName || row.name || row.userId || JSON.stringify(row)
                        : String(row)}
                    </ThemedText>
                  </View>
                ))
              )}
            </ThemedView>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 100 },
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    marginBottom: 16,
  },
  cardDark: { backgroundColor: '#1A3D4D' },
  h2: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  mono: { fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', opacity: 0.85 },
  muted: { opacity: 0.7 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ddd' },
  rank: { width: 36, fontWeight: '700', color: ThemeColors.orange },
  rowText: { flex: 1, fontSize: 14 },
});
