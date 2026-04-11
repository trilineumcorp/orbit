import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { PremiumHeader } from '@/components/premium-header';
import { getDiscussions, getStudyGroups, createDiscussion, joinStudyGroup } from '@/services/socialApi';

export default function SocialScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [tab, setTab] = useState<'discussions' | 'groups'>('discussions');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const load = async () => {
    try {
      const [d, g] = await Promise.all([getDiscussions(1, 30), getStudyGroups(1, 30)]);
      const dList = d && typeof d === 'object' && 'discussions' in (d as object) ? (d as any).discussions : [];
      const gList = g && typeof g === 'object' && 'groups' in (g as object) ? (g as any).groups : [];
      setDiscussions(Array.isArray(dList) ? dList : []);
      setGroups(Array.isArray(gList) ? gList : []);
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

  const submitDiscussion = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Missing fields', 'Add a title and message.');
      return;
    }
    const res = await createDiscussion({ title: title.trim(), content: content.trim() });
    if (res.success) {
      setTitle('');
      setContent('');
      load();
      Alert.alert('Posted', 'Your discussion was created.');
    } else {
      Alert.alert('Error', (res as any).message || 'Could not create discussion.');
    }
  };

  const tryJoin = async (groupId: string) => {
    const res = await joinStudyGroup(groupId);
    if (res.success) {
      Alert.alert('Joined', 'You joined the group.');
      load();
    } else {
      Alert.alert('Could not join', (res as any).message || 'Try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <PremiumHeader title="Community" showBackButton />
      <View style={styles.tabs}>
        {(['discussions', 'groups'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabOn, isDark && styles.tabDark]}
            onPress={() => setTab(t)}>
            <ThemedText style={[styles.tabLabel, tab === t && { color: ThemeColors.orange, fontWeight: '700' }]}>
              {t === 'discussions' ? 'Discussions' : 'Study groups'}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}>
        {loading ? (
          <ActivityIndicator size="large" color={ThemeColors.orange} style={{ marginTop: 24 }} />
        ) : tab === 'discussions' ? (
          <>
            <ThemedView style={[styles.card, isDark && styles.cardDark]}>
              <ThemedText style={styles.h3}>New discussion</ThemedText>
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                placeholder="Title"
                placeholderTextColor="#888"
                value={title}
                onChangeText={setTitle}
              />
              <TextInput
                style={[styles.input, styles.tall, isDark && styles.inputDark]}
                placeholder="What would you like to ask?"
                placeholderTextColor="#888"
                value={content}
                onChangeText={setContent}
                multiline
              />
              <TouchableOpacity style={styles.btn} onPress={submitDiscussion}>
                <ThemedText style={styles.btnText}>Post</ThemedText>
              </TouchableOpacity>
            </ThemedView>
            {discussions.map((item) => (
              <ThemedView key={String(item._id)} style={[styles.card, isDark && styles.cardDark]}>
                <ThemedText style={styles.h3}>{item.title}</ThemedText>
                <ThemedText style={styles.body}>{item.content}</ThemedText>
              </ThemedView>
            ))}
            {discussions.length === 0 && (
              <ThemedText style={styles.muted}>No discussions yet — start one above.</ThemedText>
            )}
          </>
        ) : (
          <>
            {groups.map((item) => (
              <ThemedView key={String(item._id)} style={[styles.card, isDark && styles.cardDark]}>
                <ThemedText style={styles.h3}>{item.name}</ThemedText>
                <ThemedText style={styles.body}>{item.description}</ThemedText>
                <ThemedText style={styles.meta}>Subject: {item.subject}</ThemedText>
                <TouchableOpacity style={styles.btnOutline} onPress={() => tryJoin(String(item._id))}>
                  <ThemedText style={styles.btnOutlineText}>Join</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            ))}
            {groups.length === 0 && (
              <ThemedText style={styles.muted}>No study groups yet.</ThemedText>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#EEE', alignItems: 'center' },
  tabDark: { backgroundColor: '#2A4D5D' },
  tabOn: { borderWidth: 2, borderColor: ThemeColors.orange },
  tabLabel: { fontSize: 14 },
  scroll: { padding: 16, paddingBottom: 100 },
  card: { padding: 14, borderRadius: 12, backgroundColor: '#F5F5F5', marginBottom: 12 },
  cardDark: { backgroundColor: '#1A3D4D' },
  h3: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  body: { fontSize: 14, opacity: 0.9 },
  meta: { fontSize: 12, opacity: 0.7, marginTop: 6 },
  muted: { textAlign: 'center', opacity: 0.6, marginTop: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    color: '#111',
  },
  inputDark: { borderColor: '#444', color: '#FFF', backgroundColor: '#0F2A38' },
  tall: { minHeight: 80, textAlignVertical: 'top' },
  btn: { backgroundColor: ThemeColors.orange, padding: 12, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: '700' },
  btnOutline: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: ThemeColors.orange,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnOutlineText: { color: ThemeColors.orange, fontWeight: '600' },
});
