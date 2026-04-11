import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
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
import { getBulkOperations, createBulkOperation } from '@/services/adminApi';

export default function AdminBulkOperationsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ops, setOps] = useState<any[]>([]);
  const [type, setType] = useState('notification_send');

  const load = async () => {
    try {
      const d = await getBulkOperations(1, 50);
      const list = d && typeof d === 'object' && 'operations' in (d as object) ? (d as any).operations : [];
      setOps(Array.isArray(list) ? list : []);
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

  const triggerDemo = () => {
    Alert.alert('Run bulk job?', `Type: ${type}`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Run',
        onPress: async () => {
          const res = await createBulkOperation({
            operationType: type,
            totalItems: 1,
            parameters: { note: 'Triggered from admin app' },
          });
          if (res.success) {
            Alert.alert('Queued', 'Bulk operation created.');
            load();
          } else {
            Alert.alert('Error', (res as any).message || 'Failed');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={[styles.header, isDark && styles.headerDark]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={24} color={isDark ? '#FFF' : ThemeColors.deepBlue} />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Bulk operations</ThemedText>
        <View style={{ width: 40 }} />
      </View>
      <ThemedView style={[styles.panel, isDark && styles.cardDark]}>
        <ThemedText style={styles.lbl}>Operation type</ThemedText>
        <TextInput
          style={[styles.input, isDark && styles.inputDark]}
          value={type}
          onChangeText={setType}
          placeholder="user_import | notification_send | user_deactivation"
          placeholderTextColor="#888"
        />
        <TouchableOpacity style={styles.btn} onPress={triggerDemo}>
          <ThemedText style={styles.btnText}>Create job</ThemedText>
        </TouchableOpacity>
      </ThemedView>
      {loading ? (
        <ActivityIndicator size="large" color={ThemeColors.orange} style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={ops}
          keyExtractor={(item, i) => String(item._id ?? i)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <ThemedView style={[styles.card, isDark && styles.cardDark]}>
              <ThemedText style={styles.mono}>{JSON.stringify(item, null, 2)}</ThemedText>
            </ThemedView>
          )}
          ListEmptyComponent={<ThemedText style={styles.empty}>No operations yet.</ThemedText>}
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
  panel: { margin: 16, padding: 14, borderRadius: 12, backgroundColor: '#F5F5F5' },
  card: { padding: 10, borderRadius: 10, backgroundColor: '#F5F5F5', marginBottom: 10 },
  cardDark: { backgroundColor: '#1A3D4D' },
  lbl: { marginBottom: 6, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    color: '#111',
  },
  inputDark: { borderColor: '#444', color: '#FFF', backgroundColor: '#0F2A38' },
  btn: { backgroundColor: ThemeColors.deepBlue, padding: 12, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: '700' },
  mono: { fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  empty: { textAlign: 'center', opacity: 0.6 },
});
