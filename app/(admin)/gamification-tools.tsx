import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemeColors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { adminAwardPoints } from '@/services/gamification';

export default function AdminGamificationToolsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [userId, setUserId] = useState('');
  const [points, setPoints] = useState('10');
  const [reason, setReason] = useState('Admin bonus');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!userId.trim()) {
      Alert.alert('Required', 'Enter user MongoDB id');
      return;
    }
    const p = parseInt(points, 10);
    if (Number.isNaN(p)) {
      Alert.alert('Invalid', 'Points must be a number');
      return;
    }
    setLoading(true);
    try {
      const res = await adminAwardPoints(userId.trim(), p, reason.trim() || 'Award');
      if (res.success) {
        Alert.alert('Done', 'Points awarded.');
        setUserId('');
      } else {
        Alert.alert('Error', (res as any).message || 'Failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={[styles.header, isDark && styles.headerDark]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={24} color={isDark ? '#FFF' : ThemeColors.deepBlue} />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Gamification</ThemedText>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText style={styles.hint}>
          Paste a user&apos;s id from the Students screen or database. Requires admin role.
        </ThemedText>
        <ThemedView style={[styles.card, isDark && styles.cardDark]}>
          <ThemedText style={styles.lbl}>User ID</ThemedText>
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            value={userId}
            onChangeText={setUserId}
            placeholder="MongoDB ObjectId"
            placeholderTextColor="#888"
            autoCapitalize="none"
          />
          <ThemedText style={styles.lbl}>Points</ThemedText>
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            value={points}
            onChangeText={setPoints}
            keyboardType="number-pad"
          />
          <ThemedText style={styles.lbl}>Reason</ThemedText>
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            value={reason}
            onChangeText={setReason}
          />
          <TouchableOpacity style={styles.btn} onPress={submit} disabled={loading}>
            <ThemedText style={styles.btnText}>{loading ? '...' : 'Award points'}</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
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
  scroll: { padding: 16 },
  hint: { fontSize: 13, opacity: 0.75, marginBottom: 12 },
  card: { padding: 14, borderRadius: 12, backgroundColor: '#F5F5F5' },
  cardDark: { backgroundColor: '#1A3D4D' },
  lbl: { fontWeight: '600', marginBottom: 6, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 10,
    color: '#111',
  },
  inputDark: { borderColor: '#444', color: '#FFF', backgroundColor: '#0F2A38' },
  btn: {
    marginTop: 16,
    backgroundColor: ThemeColors.orange,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: { color: '#FFF', fontWeight: '700' },
});
