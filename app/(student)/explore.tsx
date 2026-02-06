import { PremiumHeader } from '@/components/premium-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import React from 'react';
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const features = [
    {
      id: 'videos',
      title: 'Video Lectures',
      icon: 'play.rectangle.fill' as const,
      gradient: [ThemeColors.orange, '#FF8C5A'] as const,
      href: {
        pathname: '/videos' as const,
        params: { from: 'explore' },
      },
      badge: 'New',
    },
    {
      id: 'flipbooks',
      title: 'Flip Books',
      icon: 'book.closed.fill' as const,
      gradient: [ThemeColors.deepBlue, '#0A2E3D'] as const,
      href: {
        pathname: '/flipbooks' as const,
        params: { from: 'explore' },
      },
    },
    {
      id: 'exams',
      title: 'Online Exams',
      icon: 'doc.text.fill' as const,
      gradient: [ThemeColors.orange, '#FF8C5A'] as const,
      href: {
        pathname: '/exams' as const,
        params: { from: 'explore' },
      },
      badge: 'Popular',
    },
    {
      id: 'omr',
      title: 'OMR Scanner',
      icon: 'camera.fill' as const,
      gradient: [ThemeColors.deepBlue, '#0A2E3D'] as const,
      href: {
        pathname: '/omr-scanner' as const,
        params: { from: 'explore' },
      },
    },
    {
      id: 'doubts',
      title: 'Doubts & Queries',
      icon: 'questionmark.circle.fill' as const,
      gradient: [ThemeColors.orange, '#FF8C5A'] as const,
      href: {
        pathname: '/doubts' as const,
        params: { from: 'explore' },
      },
    },
    {
      id: 'reports',
      title: 'Student Reports',
      icon: 'chart.bar.fill' as const,
      gradient: [ThemeColors.deepBlue, '#0A2E3D'] as const,
      href: {
        pathname: '/reports' as const,
        params: { from: 'explore' },
      },
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <PremiumHeader title="Explore Features" />
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        
        <ThemedView style={[styles.welcomeCard, { backgroundColor: colors.card }]}>
          <LinearGradient
            colors={[ThemeColors.orange + '20', ThemeColors.deepBlue + '20']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.welcomeGradient}>
            <View style={styles.welcomeContent}>
              <View style={[styles.welcomeIconContainer, { backgroundColor: ThemeColors.orange + '30' }]}>
                <IconSymbol name="star.fill" size={40} color={ThemeColors.orange} />
              </View>
              <ThemedText type="title" style={styles.welcomeTitle}>
                Discover All Features
              </ThemedText>
              <ThemedText style={styles.welcomeDescription}>
                Explore our comprehensive learning platform designed for IIT preparation
              </ThemedText>
            </View>
          </LinearGradient>
        </ThemedView>

        <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <Link key={feature.id} href={feature.href} asChild>
              <TouchableOpacity
                style={styles.featureCard}
                activeOpacity={0.85}>
                <LinearGradient
                  colors={feature.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.featureGradient}>
                  {feature.badge && (
                    <View style={styles.badgeContainer}>
                      <ThemedText style={styles.badgeText}>{feature.badge}</ThemedText>
                    </View>
                  )}
                  <View style={styles.featureIconContainer}>
                    <IconSymbol name={feature.icon} size={48} color={ThemeColors.white} />
                  </View>
                  <ThemedText type="defaultSemiBold" style={styles.featureTitle}>
                    {feature.title}
                  </ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            </Link>
          ))}
        </View>

        <ThemedView style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <View style={[styles.infoIconContainer, { backgroundColor: ThemeColors.orange + '20' }]}>
            <IconSymbol name="info.circle.fill" size={32} color={ThemeColors.orange} />
          </View>
          <ThemedText type="defaultSemiBold" style={styles.infoTitle}>
            Need Help?
          </ThemedText>
          <ThemedText style={styles.infoText}>
            Tap on any feature card to explore and start learning. All features are designed to enhance your IIT preparation journey.
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 120,
  },
  welcomeCard: {
    borderRadius: 24,
    marginBottom: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  welcomeGradient: {
    padding: 28,
  },
  welcomeContent: {
    alignItems: 'center',
  },
  welcomeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeDescription: {
    fontSize: 15,
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  featureCard: {
    width: '47%',
    aspectRatio: 1.1,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  featureGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    position: 'relative',
  },
  badgeContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: ThemeColors.white + '30',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ThemeColors.white + '50',
  },
  badgeText: {
    color: ThemeColors.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  featureIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: ThemeColors.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    color: ThemeColors.white,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
    lineHeight: 22,
  },
  featureDescription: {
    color: ThemeColors.white,
    fontSize: 12,
    opacity: 0.95,
    lineHeight: 16,
    fontWeight: '500',
  },
  featureArrow: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    opacity: 0.9,
  },
  infoCard: {
    padding: 24,
    borderRadius: 20,
    flexDirection: 'row',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  infoIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
    flex: 1,
    fontWeight: '500',
  },
});

