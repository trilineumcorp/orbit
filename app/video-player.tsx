import { PremiumHeader } from '@/components/premium-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemeColors } from '@/constants/theme';
import { extractYouTubeId } from '@/utils/youtube';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, StyleSheet, View, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isTablet = screenWidth >= 768;
const videoHeight = isTablet ? screenHeight * 0.5 : screenWidth * 0.5625; // 16:9 aspect ratio

export default function VideoPlayerScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);
  
  const fromExplore = params.from === 'explore';

  const videoId = extractYouTubeId(params.url as string);
  // Use youtube-nocookie.com by default (more reliable for embeds, privacy-friendly)
  // Minimal parameters to avoid Error 153
  const embedUrl = videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?playsinline=1&rel=0&modestbranding=1&controls=1` : '';

  useEffect(() => {
    if (!videoId) {
      Alert.alert('Error', 'Invalid video URL');
      router.back();
    }
  }, [videoId, router]);

  if (!videoId) {
    return null;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          html, body {
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: #000;
          }
          .container {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #000;
          }
          .video-wrapper {
            position: relative;
            width: 100%;
            height: 100%;
            padding-bottom: 0;
          }
          iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="video-wrapper">
            <iframe
              id="youtube-player"
              src="${embedUrl}"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowfullscreen
              playsinline="true"
              webkitallowfullscreen="true"
              mozallowfullscreen="true"
            ></iframe>
          </div>
        </div>
      </body>
    </html>
  `;

  const handleLoadEnd = () => {
    // Give it a moment for the iframe to load
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <ThemedView style={styles.container}>
      <PremiumHeader
        title={params.title as string || 'Video Player'}
        showBackButton={true}
        onBackPress={fromExplore ? () => router.push('/explore') : undefined}
      />
      
      <View style={styles.playerContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: htmlContent }}
          style={styles.webview}
          onLoadEnd={handleLoadEnd}
          allowsFullscreenVideo={true}
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          mixedContentMode="always"
          allowsInlineMediaPlayback={true}
          androidLayerType="hardware"
          androidHardwareAccelerationDisabled={false}
          renderLoading={() => (
            <View style={styles.loader}>
              <View style={styles.loaderIconContainer}>
                <IconSymbol name="play.rectangle.fill" size={48} color={ThemeColors.orange} />
              </View>
              <ActivityIndicator size="large" color={ThemeColors.orange} style={styles.spinner} />
              <ThemedText style={styles.loadingText}>Loading video...</ThemedText>
            </View>
          )}
          onShouldStartLoadWithRequest={(request) => {
            // Allow YouTube embed URLs (including nocookie domain), block other YouTube pages
            const url = request.url;
            if (url.includes('youtube.com/embed') || 
                url.includes('youtube-nocookie.com/embed') || 
                url === 'about:blank') {
              return true;
            }
            if (url.includes('youtube.com/watch') || 
                url.includes('youtu.be/') || 
                url.includes('youtube.com/channel') ||
                url.includes('youtube.com/user') ||
                (url.includes('youtube.com') && !url.includes('embed') && !url.includes('api'))) {
              return false;
            }
            return true;
          }}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error: ', nativeEvent);
            setLoading(false);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView HTTP error: ', nativeEvent);
          }}
        />
        
        {loading && (
          <View style={styles.loader}>
            <View style={styles.loaderIconContainer}>
              <IconSymbol name="play.rectangle.fill" size={48} color={ThemeColors.orange} />
            </View>
            <ActivityIndicator size="large" color={ThemeColors.orange} style={styles.spinner} />
            <ThemedText style={styles.loadingText}>Loading video...</ThemedText>
          </View>
        )}
      </View>
      
      {params.description && (
        <View style={styles.descriptionContainer}>
          <ThemedText style={styles.descriptionTitle}>Description</ThemedText>
          <ThemedText style={styles.descriptionText}>{params.description as string}</ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  playerContainer: {
    width: '100%',
    height: videoHeight,
    backgroundColor: '#000',
    position: 'relative',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    zIndex: 10,
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
    color: ThemeColors.lightNeutral,
    fontSize: 16,
    fontWeight: '600',
  },
  descriptionContainer: {
    padding: 16,
    backgroundColor: '#1A1A1A',
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: ThemeColors.lightNeutral,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
});

