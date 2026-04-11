import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Platform,
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
import { getModerationActions, getUserReportsAdmin } from '@/services/adminApi';

export default function AdminModerationScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [tab, setTab] = useState<'actions' | 'reports'>('actions');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actions, setActions] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);

  const load = async () => {
    try {
      const [a, r] = await Promise.all([getModerationActions(1, 50), getUserReportsAdmin(1, 50)]);
      const al = a && typeof a === 'object' && 'actions' in (a as object) ? (a as any).actions : [];
      const rl = r && typeof r === 'object' && 'reports' in (r as object) ? (r as any).reports : [];
      setActions(Array.isArray(al) ? al : []);
      setReports(Array.isArray(rl) ? rl : []);
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

  const data = tab === 'actions' ? actions : reports;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={[styles.header, isDark && styles.headerDark]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={24} color={isDark ? '#FFF' : ThemeColors.deepBlue} />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Moderation</ThemedText>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.tabs}>
        {(['actions', 'reports'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabOn]}
            onPress={() => setTab(t)}>
            <ThemedText style={{ fontWeight: tab === t ? '700' : '400' }}>
              {t === 'actions' ? 'Actions log' : 'User reports'}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={ThemeColors.orange} style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, i) => String(item._id ?? i)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <ThemedView style={[styles.card, isDark && styles.cardDark]}>
              <ThemedText style={styles.mono}>{JSON.stringify(item, null, 2)}</ThemedText>
            </ThemedView>
          )}
          ListEmptyComponent={<ThemedText style={styles.empty}>Nothing here yet.</ThemedText>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  headerDark: { borderBottomColor: '#2A4D5D' },
  backBtn: { padding: 8 },
  title: { fontSize: 18, fontWeight: '700' },
  tabs: { flexDirection: 'row', padding: 12, gap: 8 },
  tab: { flex: 1, padding: 10, borderRadius: 10, backgroundColor: '#EEE', alignItems: 'center' },
  tabOn: { backgroundColor: ThemeColors.orange + '33' },
  card: { padding: 10, borderRadius: 10, backgroundColor: '#F5F5F5', marginBottom: 10 },
  cardDark: { backgroundColor: '#1A3D4D' },
  mono: { fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  empty: { textAlign: 'center', opacity: 0.6, marginTop: 24 },
});
