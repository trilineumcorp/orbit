import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemeColors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';

type LinkItem = { label: string; icon: string; path: string };

const LEARNING_LINKS: LinkItem[] = [
  { label: 'Reports & progress', icon: 'chart.bar.fill', path: '/(student)/reports' },
  { label: 'Points & leaderboard', icon: 'trophy.fill', path: '/(student)/gamification' },
  { label: 'Community', icon: 'bubble.left.and.bubble.right.fill', path: '/(student)/social' },
  { label: 'AI study assistant', icon: 'sparkles', path: '/(student)/ai-chat' },
  { label: 'Premium & billing', icon: 'creditcard.fill', path: '/(student)/premium' },
  { label: 'Activities', icon: 'puzzlepiece.extension.fill', path: '/(student)/activities' },
  { label: 'Notifications', icon: 'bell.fill', path: '/(student)/notifications' },
  { label: 'Watch later', icon: 'bookmark.fill', path: '/(student)/watch-later' },
];

const ACCOUNT_LINKS: LinkItem[] = [
  { label: 'My account', icon: 'person.fill', path: '/(student)/profile-menu' },
  { label: 'Settings', icon: 'gearshape.fill', path: '/(student)/settings' },
  { label: 'Change password', icon: 'lock.fill', path: '/(student)/change-password' },
  { label: 'Help & support', icon: 'questionmark.circle.fill', path: '/(student)/help' },
];

export default function MoreHubScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const Row = ({ item }: { item: LinkItem }) => (
    <TouchableOpacity
      style={[styles.row, isDark && styles.rowDark]}
      onPress={() => router.push(item.path as any)}
      activeOpacity={0.7}>
      <View style={styles.iconWrap}>
        <IconSymbol name={item.icon as any} size={22} color={ThemeColors.orange} />
      </View>
      <ThemedText style={styles.label}>{item.label}</ThemedText>
      <IconSymbol name="chevron.right" size={18} color="#888" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={[styles.header, isDark && styles.headerDark]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <IconSymbol name="chevron.left" size={24} color={isDark ? '#FFF' : ThemeColors.deepBlue} />
        </TouchableOpacity>
        <ThemedText style={styles.title}>More</ThemedText>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText style={styles.sub}>
          Shortcuts to learning tools, account, and support — same destinations as the profile menu where applicable.
        </ThemedText>

        <ThemedText style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Learning & tools</ThemedText>
        {LEARNING_LINKS.map((item) => (
          <Row key={item.path} item={item} />
        ))}

        <ThemedText style={[styles.sectionTitle, isDark && styles.sectionTitleDark, styles.sectionSpacer]}>
          Account & security
        </ThemedText>
        {ACCOUNT_LINKS.map((item) => (
          <Row key={item.path} item={item} />
        ))}
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
  title: { fontSize: 18, fontWeight: '700' },
  scroll: { padding: 16, paddingBottom: 120 },
  sub: { opacity: 0.7, marginBottom: 16, fontSize: 14, lineHeight: 20 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: '#666',
    marginBottom: 10,
  },
  sectionTitleDark: { color: '#AAA' },
  sectionSpacer: { marginTop: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    marginBottom: 10,
  },
  rowDark: { backgroundColor: '#1A3D4D' },
  iconWrap: { marginRight: 12, width: 28, alignItems: 'center' },
  label: { flex: 1, fontSize: 16, fontWeight: '600' },
});
