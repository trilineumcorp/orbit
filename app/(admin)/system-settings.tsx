import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ThemeColors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getSystemSettings, updateSystemSetting } from '@/services/adminApi';

export default function AdminSystemSettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [settings, setSettings] = useState<any[]>([]);

  const load = async () => {
    try {
      const d = await getSystemSettings();
      setSettings(Array.isArray(d) ? d : []);
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

  const saveValue = async (item: any, text: string) => {
    let parsed: unknown = text;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
    const res = await updateSystemSetting({
      key: item.key,
      value: parsed,
      category: item.category || 'general',
      description: item.description,
    });
    if (res.success) {
      load();
    } else {
      Alert.alert('Error', (res as any).message || 'Failed');
    }
  };

  const edit = (item: any) => {
    const val = typeof item.value === 'object' ? JSON.stringify(item.value) : String(item.value ?? '');
    if (Platform.OS === 'ios') {
      Alert.prompt(`Edit ${item.key}`, 'New value', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: (text) => text !== undefined && saveValue(item, text),
        },
      ], 'plain-text', val);
    } else {
      Alert.alert(
        item.key,
        'Use API or iOS client to edit. Value: ' + val,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={[styles.header, isDark && styles.headerDark]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={24} color={isDark ? '#FFF' : ThemeColors.deepBlue} />
        </TouchableOpacity>
        <ThemedText style={styles.title}>System settings</ThemedText>
        <View style={{ width: 40 }} />
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={ThemeColors.orange} style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={settings}
          keyExtractor={(item, i) => String(item._id ?? item.key ?? i)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => edit(item)} activeOpacity={0.7}>
              <ThemedView style={[styles.card, isDark && styles.cardDark]}>
                <ThemedText style={styles.key}>{item.key}</ThemedText>
                <ThemedText style={styles.val} numberOfLines={3}>
                  {typeof item.value === 'object' ? JSON.stringify(item.value) : String(item.value)}
                </ThemedText>
                <ThemedText style={styles.cat}>{item.category}</ThemedText>
              </ThemedView>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <ThemedText style={styles.empty}>No settings in DB yet — add via API or seed.</ThemedText>
          }
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
  card: { padding: 14, borderRadius: 12, backgroundColor: '#F5F5F5', marginBottom: 12 },
  cardDark: { backgroundColor: '#1A3D4D' },
  key: { fontWeight: '700', fontSize: 15 },
  val: { marginTop: 6, fontSize: 13, opacity: 0.9 },
  cat: { marginTop: 6, fontSize: 11, opacity: 0.6 },
  empty: { textAlign: 'center', opacity: 0.6, marginTop: 24 },
});
