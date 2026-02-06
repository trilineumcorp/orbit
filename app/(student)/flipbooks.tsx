import { PremiumHeader } from '@/components/premium-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getFlipBooks, FlipBook } from '@/services/content';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { FlipBookSkeleton } from '@/components/skeleton';
import { detectNetworkSpeed, getMinLoadingTime } from '@/utils/network';
import { useAuth } from '@/contexts/AuthContext';

export default function FlipBooksScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [flipbooks, setFlipbooks] = useState<FlipBook[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  const fromExplore = params.from === 'explore';

  // Get user's standard from class field
  const userStandard = user?.class ? parseInt(user.class, 10) : undefined;

  useEffect(() => {
    loadFlipBooks();
  }, [userStandard]);

  const loadFlipBooks = async () => {
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
      // Filter flipbooks by user's standard if available
      const loadedFlipBooks = await getFlipBooks(userStandard);
      const elapsedTime = Date.now() - startTime;
      
      // Ensure minimum loading time for better UX
      if (elapsedTime < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
      }
      
      setFlipbooks(loadedFlipBooks);
    } catch (error: any) {
      console.error('Failed to load flipbooks:', error);
      setFlipbooks([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const filteredFlipBooks = flipbooks.filter(flipbook =>
    flipbook.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={styles.container}>
      <PremiumHeader
        title="Flip Books"
        showBackButton={true}
        onBackPress={fromExplore ? () => router.push('/explore') : undefined}
      />


      <ScrollView 
        style={styles.flipbookList}
        contentContainerStyle={styles.flipbookListContent}
        showsVerticalScrollIndicator={false}>
        
        <ThemedView style={[styles.welcomeCard, { backgroundColor: colors.card }]}>
          <LinearGradient
            colors={[ThemeColors.deepBlue + '20', ThemeColors.orange + '20']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.welcomeGradient}>
            <View style={styles.welcomeContent}>
              <View style={[styles.welcomeIconContainer, { backgroundColor: ThemeColors.deepBlue + '30' }]}>
                <IconSymbol name="book.closed.fill" size={40} color={ThemeColors.deepBlue} />
              </View>
              <ThemedText type="title" style={styles.welcomeTitle}>
                Flip Books
              </ThemedText>
              <ThemedText style={styles.welcomeDescription}>
                Browse PDF study materials and resources for comprehensive learning
              </ThemedText>
            </View>
          </LinearGradient>
        </ThemedView>

        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.icon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search flip books..."
            placeholderTextColor={colors.icon}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        {loading ? (
          <View style={styles.skeletonContainer}>
            <FlipBookSkeleton count={6} />
          </View>
        ) : filteredFlipBooks.length === 0 ? (
          <ThemedView style={styles.emptyContainer}>
            <View style={[styles.emptyIconContainer, { backgroundColor: ThemeColors.deepBlue + '20' }]}>
              <IconSymbol name="book.closed.fill" size={64} color={ThemeColors.deepBlue} />
            </View>
            <ThemedText style={styles.emptyText}>No flip books available</ThemedText>
            <ThemedText style={styles.emptySubtext}>Flipbooks will appear here when added by admin</ThemedText>
          </ThemedView>
        ) : (
          <View style={styles.flipbookGrid}>
            {filteredFlipBooks.map(flipbook => (
              <Link
                key={flipbook._id || flipbook.id}
                href={{
                  pathname: '/flipbook-viewer',
                  params: { 
                    flipbookId: flipbook._id || flipbook.id || '', 
                    title: flipbook.title, 
                    url: flipbook.pdfUrl,
                    ...(fromExplore && { from: 'explore' }),
                  },
                }}
                asChild>
                <TouchableOpacity
                  style={[styles.flipbookCard, { backgroundColor: colors.card }]}
                  activeOpacity={0.85}>
                  <View style={styles.thumbnailContainer}>
                    <LinearGradient
                      colors={[ThemeColors.deepBlue + '20', ThemeColors.orange + '15']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.pdfGradient}>
                      <View style={styles.pdfIconWrapper}>
                        <IconSymbol name="doc.text.fill" size={56} color={ThemeColors.deepBlue} />
                      </View>
                      <View style={styles.pdfLines}>
                        <View style={[styles.pdfLine, { width: '80%' }]} />
                        <View style={[styles.pdfLine, { width: '70%' }]} />
                        <View style={[styles.pdfLine, { width: '85%' }]} />
                        <View style={[styles.pdfLine, { width: '60%' }]} />
                      </View>
                    </LinearGradient>
                    <View style={styles.pdfOverlay}>
                      <View style={styles.pdfBadge}>
                        <IconSymbol name="doc.text.fill" size={10} color={ThemeColors.white} />
                        <ThemedText style={styles.pdfBadgeText}>PDF</ThemedText>
                      </View>
                    </View>
                  </View>
                  <View style={styles.flipbookInfo}>
                    <ThemedText type="defaultSemiBold" numberOfLines={2} style={styles.flipbookTitle}>
                      {flipbook.title}
                    </ThemedText>
                    {flipbook.uploadDate && (
                      <ThemedText style={styles.uploadDate} numberOfLines={1}>
                        {new Date(flipbook.uploadDate).toLocaleDateString()}
                      </ThemedText>
                    )}
                  </View>
                </TouchableOpacity>
              </Link>
            ))}
          </View>
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
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    fontSize: 16,
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
    flexDirection: 'row',
    justifyContent: 'center',
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
  flipbookList: {
    flex: 1,
  },
  flipbookListContent: {
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
  flipbookGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 4,
  },
  flipbookCard: {
    width: '47%',
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  thumbnailContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
    backgroundColor: ThemeColors.lightNeutral,
    overflow: 'hidden',
  },
  pdfGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pdfIconWrapper: {
    marginBottom: 16,
  },
  pdfLines: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  pdfLine: {
    height: 4,
    backgroundColor: ThemeColors.deepBlue + '30',
    borderRadius: 2,
  },
  pdfOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 8,
  },
  pdfBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ThemeColors.deepBlue + 'E6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  pdfBadgeText: {
    color: ThemeColors.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipbookInfo: {
    padding: 14,
  },
  flipbookTitle: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
    letterSpacing: 0.2,
    marginBottom: 6,
  },
  uploadDate: {
    fontSize: 12,
    opacity: 0.7,
    fontWeight: '500',
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
  skeletonContainer: {
    paddingTop: 4,
  },
});

