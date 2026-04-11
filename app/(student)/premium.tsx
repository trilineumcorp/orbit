import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { PremiumHeader } from '@/components/premium-header';
import { getSubscriptionPlans, getUserSubscription, getPaymentHistory } from '@/services/paymentApi';

export default function PremiumScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [sub, setSub] = useState<unknown>(null);
  const [history, setHistory] = useState<unknown>(null);

  useEffect(() => {
    (async () => {
      try {
        const [p, s, h] = await Promise.all([
          getSubscriptionPlans(),
          getUserSubscription().catch(() => null),
          getPaymentHistory().catch(() => null),
        ]);
        setPlans(p);
        setSub(s);
        setHistory(h);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <PremiumHeader title="Premium & billing" showBackButton />
      <ScrollView contentContainerStyle={styles.scroll}>
        {loading ? (
          <ActivityIndicator size="large" color={ThemeColors.orange} style={{ marginTop: 32 }} />
        ) : (
          <>
            <ThemedView style={[styles.card, isDark && styles.cardDark]}>
              <ThemedText style={styles.h2}>Current subscription</ThemedText>
              <ThemedText style={styles.mono}>
                {sub ? JSON.stringify(sub, null, 2) : 'No active subscription. Choose a plan when checkout is configured (Stripe keys in backend).'}
              </ThemedText>
            </ThemedView>
            <ThemedText style={styles.h2}>Plans</ThemedText>
            {plans.length === 0 ? (
              <ThemedText style={styles.muted}>No plans in database — an admin can create plans via API or seed.</ThemedText>
            ) : (
              plans.map((plan: any) => (
                <ThemedView key={String(plan._id ?? plan.id)} style={[styles.card, isDark && styles.cardDark]}>
                  <ThemedText style={styles.h3}>{plan.name}</ThemedText>
                  <ThemedText style={styles.body}>{plan.description}</ThemedText>
                  <ThemedText style={styles.price}>
                    {plan.price} / {plan.interval}
                  </ThemedText>
                </ThemedView>
              ))
            )}
            <ThemedView style={[styles.card, isDark && styles.cardDark]}>
              <ThemedText style={styles.h2}>Payment history</ThemedText>
              <ThemedText style={styles.mono}>
                {history ? JSON.stringify(history, null, 2) : 'No payments yet.'}
              </ThemedText>
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
  card: { padding: 14, borderRadius: 12, backgroundColor: '#F5F5F5', marginBottom: 14 },
  cardDark: { backgroundColor: '#1A3D4D' },
  h2: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  h3: { fontSize: 16, fontWeight: '600' },
  body: { fontSize: 14, opacity: 0.85, marginTop: 4 },
  price: { marginTop: 8, fontWeight: '700', color: ThemeColors.orange },
  mono: { fontSize: 12, fontFamily: 'monospace' },
  muted: { opacity: 0.65, marginBottom: 12 },
});
