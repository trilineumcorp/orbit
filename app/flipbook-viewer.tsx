import { PremiumHeader } from '@/components/premium-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemeColors } from '@/constants/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function FlipBookViewerScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const pdfUrl = params.url as string;
  
  const fromExplore = params.from === 'explore';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            margin: 0;
            padding: 0;
            background: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }
          iframe {
            width: 100%;
            height: 100%;
            border: none;
          }
        </style>
      </head>
      <body>
        <iframe src="${pdfUrl}" type="application/pdf"></iframe>
      </body>
    </html>
  `;

  return (
    <ThemedView style={styles.container}>
      <PremiumHeader
        title={params.title as string || 'Flip Book'}
        showBackButton={true}
        onBackPress={fromExplore ? () => router.push('/explore') : undefined}
      />
      <WebView
        source={{ html: htmlContent }}
        style={styles.webview}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loader}>
            <View style={styles.loaderIconContainer}>
              <IconSymbol name="doc.text.fill" size={48} color={ThemeColors.orange} />
            </View>
            <ActivityIndicator size="large" color={ThemeColors.orange} style={styles.spinner} />
            <ThemedText style={styles.loadingText}>Loading PDF...</ThemedText>
          </View>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  webview: {
    flex: 1,
  },
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loaderIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: ThemeColors.orange + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  spinner: {
    marginTop: 8,
  },
  loadingText: {
    marginTop: 20,
    color: ThemeColors.grayText,
    fontSize: 16,
    fontWeight: '600',
  },
});

