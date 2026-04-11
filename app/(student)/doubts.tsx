import { PremiumHeader } from '@/components/premium-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { addDoubt, getDoubts } from '@/services/storage';
import { Doubt } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ListSkeleton } from '@/components/skeleton';
import { detectNetworkSpeed, getMinLoadingTime } from '@/utils/network';

export default function DoubtsScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDoubtTitle, setNewDoubtTitle] = useState('');
  const [newDoubtDescription, setNewDoubtDescription] = useState('');
  const [newDoubtSubject, setNewDoubtSubject] = useState('');
  const [loading, setLoading] = useState(true);
  
  const fromExplore = params.from === 'explore';

  useEffect(() => {
    loadDoubts();
  }, []);

  const loadDoubts = async () => {
    try {
      setLoading(true);
      let minLoadingTime = 300; // Default minimum loading time
      
      try {
        const networkSpeed = await detectNetworkSpeed();
        minLoadingTime = getMinLoadingTime(networkSpeed);
      } catch (networkError) {
        console.warn('Network speed detection failed, using default:', networkError);
      }
      
      const startTime = Date.now();
      const loadedDoubts = await getDoubts();
      const elapsedTime = Date.now() - startTime;
      
      // Ensure minimum loading time for better UX
      if (elapsedTime < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
      }
      
      setDoubts(loadedDoubts);
    } catch (error) {
      console.error('Failed to load doubts:', error);
      setDoubts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const submitDoubt = async () => {
    if (!newDoubtTitle.trim() || !newDoubtDescription.trim()) {
      Alert.alert('Error', 'Please fill in title and description');
      return;
    }

    const newDoubt: Doubt = {
      id: Date.now().toString(),
      title: newDoubtTitle,
      description: newDoubtDescription,
      subject: newDoubtSubject || undefined,
      status: 'pending',
      createdAt: new Date(),
    };

    await addDoubt(newDoubt);
    await loadDoubts();
    setNewDoubtTitle('');
    setNewDoubtDescription('');
    setNewDoubtSubject('');
    setShowAddForm(false);
    Alert.alert('Success', 'Your doubt has been submitted');
  };

  const filteredDoubts = doubts.filter(
    doubt =>
      doubt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doubt.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: Doubt['status']) => {
    switch (status) {
      case 'resolved':
        return '#4CAF50';
      case 'in-progress':
        return ThemeColors.orange;
      default:
        return ThemeColors.grayText;
    }
  };

  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={styles.container}>
      <PremiumHeader
        title="Doubts & Queries"
        showBackButton={true}
        onBackPress={fromExplore ? () => router.push('/explore') : undefined}
        rightAction={{
          icon: 'plus.circle.fill',
          onPress: () => setShowAddForm(!showAddForm),
        }}
      />

      {showAddForm && (
        <ThemedView style={[styles.addForm, { backgroundColor: colors.card }]}>
          <ThemedText type="subtitle" style={styles.formTitle}>
            Ask a Question
          </ThemedText>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            placeholder="Title"
            placeholderTextColor={colors.icon}
            value={newDoubtTitle}
            onChangeText={setNewDoubtTitle}
          />
          <TextInput
            style={[styles.textArea, { color: colors.text, borderColor: colors.border }]}
            placeholder="Describe your doubt..."
            placeholderTextColor={colors.icon}
            value={newDoubtDescription}
            onChangeText={setNewDoubtDescription}
            multiline
            numberOfLines={4}
          />
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            placeholder="Subject (optional)"
            placeholderTextColor={colors.icon}
            value={newDoubtSubject}
            onChangeText={setNewDoubtSubject}
          />
          <View style={styles.formButtons}>
            <TouchableOpacity
              style={[styles.formButton, { backgroundColor: ThemeColors.orange }]}
              onPress={submitDoubt}
              activeOpacity={0.8}>
              <ThemedText style={{ color: ThemeColors.white, fontWeight: '600' }}>Submit</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.formButton, { backgroundColor: colors.border }]}
              onPress={() => setShowAddForm(false)}
              activeOpacity={0.8}>
              <ThemedText style={{ fontWeight: '600' }}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      )}

      <ScrollView style={styles.doubtsList} contentContainerStyle={styles.doubtsListContent} showsVerticalScrollIndicator={false}>
        
        <ThemedView style={[styles.welcomeCard, { backgroundColor: colors.card }]}>
          <LinearGradient
            colors={[ThemeColors.orange + '20', ThemeColors.deepBlue + '20']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.welcomeGradient}>
            <View style={styles.welcomeContent}>
              <View style={[styles.welcomeIconContainer, { backgroundColor: ThemeColors.orange + '30' }]}>
                <IconSymbol name="questionmark.circle.fill" size={40} color={ThemeColors.orange} />
              </View>
              <ThemedText type="title" style={styles.welcomeTitle}>
                Doubts & Queries
              </ThemedText>
              <ThemedText style={styles.welcomeDescription}>
                Ask questions and get answers from experts to clarify your concepts
              </ThemedText>
            </View>
          </LinearGradient>
        </ThemedView>

        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.icon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search doubts..."
            placeholderTextColor={colors.icon}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <TouchableOpacity style={styles.aiBannerContainer} onPress={() => router.push('/ai-chat')} activeOpacity={0.9}>
          <LinearGradient
            colors={[ThemeColors.deepBlue, '#0A2E3D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.aiBannerGradient}
          >
            <View style={styles.aiBannerIcon}>
              <IconSymbol name="sparkles" size={24} color={ThemeColors.orange} />
            </View>
            <View style={styles.aiBannerTextContainer}>
              <ThemedText style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Ask the AI Instructor</ThemedText>
              <ThemedText style={{ color: '#fff', opacity: 0.8, fontSize: 13, marginTop: 2 }}>Get instant answers before posting</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
        {loading ? (
          <ListSkeleton count={5} itemHeight={120} />
        ) : filteredDoubts.length === 0 ? (
          <ThemedView style={styles.emptyContainer}>
            <IconSymbol name="questionmark.circle.fill" size={64} color={colors.icon} />
            <ThemedText style={styles.emptyText}>No doubts yet</ThemedText>
            <ThemedText style={styles.emptySubtext}>Ask your first question to get started</ThemedText>
          </ThemedView>
        ) : (
          filteredDoubts.map(doubt => (
            <ThemedView
              key={doubt.id}
              style={[styles.doubtCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.doubtHeader}>
                <View style={styles.doubtHeaderLeft}>
                  <ThemedText type="defaultSemiBold" numberOfLines={1}>
                    {doubt.title}
                  </ThemedText>
                  {doubt.subject && (
                    <ThemedText style={styles.subjectTag}>{doubt.subject}</ThemedText>
                  )}
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(doubt.status) + '20' },
                  ]}>
                  <ThemedText
                    style={[styles.statusText, { color: getStatusColor(doubt.status) }]}>
                    {doubt.status.charAt(0).toUpperCase() + doubt.status.slice(1).replace('-', ' ')}
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={styles.doubtDescription} numberOfLines={3}>
                {doubt.description}
              </ThemedText>
              <View style={styles.doubtFooter}>
                <ThemedText style={styles.doubtDate}>
                  {new Date(doubt.createdAt).toLocaleDateString()}
                </ThemedText>
                {doubt.response && (
                  <View style={styles.responseIndicator}>
                    <IconSymbol name="checkmark.circle.fill" size={16} color={ThemeColors.orange} />
                    <ThemedText style={styles.responseText}>Answered</ThemedText>
                  </View>
                )}
              </View>
              {doubt.response && (
                <ThemedView style={[styles.responseBox, { backgroundColor: ThemeColors.orange + '10' }]}>
                  <ThemedText style={styles.responseLabel}>Response:</ThemedText>
                  <ThemedText style={styles.responseText}>{doubt.response}</ThemedText>
                </ThemedView>
              )}
            </ThemedView>
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addForm: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
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
  formTitle: {
    marginBottom: 20,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    fontSize: 16,
    fontWeight: '500',
  },
  textArea: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    fontWeight: '500',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  formButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  doubtsList: {
    flex: 1,
  },
  doubtsListContent: {
    padding: 20,
    paddingBottom: 100,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  aiBannerContainer: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  aiBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  aiBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,122,0,0.2)', // Orange with opacity
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiBannerTextContainer: {
    flex: 1,
  },
  doubtCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
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
  doubtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  doubtHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  subjectTag: {
    fontSize: 13,
    marginTop: 6,
    opacity: 0.7,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  doubtDescription: {
    fontSize: 14,
    marginBottom: 14,
    opacity: 0.8,
    lineHeight: 20,
    fontWeight: '500',
  },
  doubtFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  doubtDate: {
    fontSize: 13,
    opacity: 0.6,
    fontWeight: '500',
  },
  responseIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  responseText: {
    fontSize: 13,
    color: ThemeColors.orange,
    fontWeight: '600',
  },
  responseBox: {
    marginTop: 14,
    padding: 16,
    borderRadius: 12,
  },
  responseLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
    opacity: 0.8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 15,
    marginTop: 8,
    opacity: 0.7,
    fontWeight: '500',
  },
});

