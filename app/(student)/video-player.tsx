import { PremiumHeader } from '@/components/premium-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemeColors } from '@/constants/theme';
import { extractYouTubeId } from '@/utils/youtube';
import { checkWatchLater, toggleWatchLater } from '@/services/storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, StyleSheet, View, Platform, TouchableOpacity, Linking, TextInput, FlatList, KeyboardAvoidingView } from 'react-native';
import { WebView } from 'react-native-webview';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isTablet = screenWidth >= 768;
const videoHeight = isTablet ? screenHeight * 0.5 : screenWidth * 0.5625; // 16:9 aspect ratio

export default function VideoPlayerScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [hasReceivedLoadSignal, setHasReceivedLoadSignal] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const [startAt, setStartAt] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const fromExplore = params.from === 'explore';
  const contentId = (params.id || params.videoId) as string;
  const youtubeUrl = (params.url as string) || '';
  const videoId = youtubeUrl ? extractYouTubeId(youtubeUrl) : null;
  
  // Use youtube-nocookie.com by default (more reliable for embeds, privacy-friendly)
  // Try different embed URL formats based on retry count
  // Includes referrerpolicy fix for Error 153
  const getEmbedUrl = (attempt: number) => {
    if (!videoId) return '';
    
    // Strategy: Try nocookie first (most reliable), then regular youtube, then with different params
    // All attempts include proper referrer policy to prevent Error 153
    if (attempt === 0) {
      return `https://www.youtube-nocookie.com/embed/${videoId}?playsinline=1&rel=0&start=${startAt}&modestbranding=1&controls=1&origin=${encodeURIComponent('https://www.youtube.com')}`;
    } else if (attempt === 1) {
      return `https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0&start=${startAt}&modestbranding=1&controls=1&origin=${encodeURIComponent('https://www.youtube.com')}`;
    } else if (attempt === 2) {
      return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&start=${startAt}&rel=0&modestbranding=1&controls=1&origin=${encodeURIComponent('https://www.youtube.com')}`;
    } else {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&start=${startAt}&rel=0&modestbranding=1&controls=1&origin=${encodeURIComponent('https://www.youtube.com')}`;
    }
  };
  
  const embedUrl = getEmbedUrl(retryCount);

  useEffect(() => {
    if (!youtubeUrl || !videoId) {
      Alert.alert('Error', 'Invalid video URL');
      router.back();
    } else {
      checkWatchLater(videoId).then(setIsBookmarked).catch(console.error);
      
      // Fetch progress
      if (contentId) {
        apiService.get<any>(`/videos/${contentId}/progress`).then(res => {
          if (res.success && res.data?.lastWatchedTimestamp) {
            setStartAt(res.data.lastWatchedTimestamp);
          }
        }).catch(err => console.log('No previous progress', err));
      }
    }
  }, [videoId, youtubeUrl, router, contentId]);

  useEffect(() => {
    if (!contentId) return;
    
    // Setup Socket.io
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000/api';
    const socketUrl = apiUrl.replace('/api', '');
    
    socketRef.current = io(socketUrl);
    socketRef.current.emit('joinVideo', contentId);
    
    socketRef.current.on('newMessage', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    
    // Setup progress saving interval
    progressIntervalRef.current = setInterval(() => {
      // Periodic ping to save "active" status or we could rely on WebView reporting time
      // For simplicity, we just save a baseline complete status after 60s
      setStartAt(prev => {
        const nextTime = prev + 10;
        apiService.put(`/videos/${contentId}/progress`, { lastWatchedTimestamp: nextTime, completed: false })
          .catch(console.error);
        return nextTime;
      });
    }, 10000); // 10s increments
    
    return () => {
      socketRef.current?.disconnect();
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [contentId]);

  const sendMessage = () => {
    if (!chatInput.trim() || !contentId) return;
    socketRef.current?.emit('sendMessage', {
      videoId: contentId,
      studentId: user?.id,
      message: chatInput
    });
    setChatInput('');
  };

  const handleToggleBookmark = async () => {
    if (videoId) {
      try {
        const newState = await toggleWatchLater(videoId);
        setIsBookmarked(newState);
      } catch (err) {
        console.error('Failed to bookmark', err);
      }
    }
  };

  // Set up loading timeout - only if we haven't received load signals
  useEffect(() => {
    // Clear any existing timeout
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
    
    // Only set timeout if we're loading and haven't received any load signals
    if (loading && !error && !hasReceivedLoadSignal) {
      // Increased timeout to 15 seconds to give YouTube more time to load
      loadTimeoutRef.current = setTimeout(() => {
        // Double check we're still loading and haven't received signals
        if (loading && !hasReceivedLoadSignal) {
          console.log('Video load timeout - showing error');
          setError('Video is taking too long to load. Please try watching on YouTube.');
          setLoading(false);
        }
      }, 15000);
    }

    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
    };
  }, [loading, error, retryCount, hasReceivedLoadSignal]);

  const handleFullscreen = () => {
    // Redirect to YouTube when fullscreen is requested
    if (youtubeUrl) {
      Linking.openURL(youtubeUrl).catch(err => {
        console.error('Failed to open YouTube:', err);
        Alert.alert('Error', 'Could not open YouTube. Please try again.');
      });
    } else if (videoId) {
      // Fallback to constructing YouTube URL from video ID
      const fallbackUrl = `https://www.youtube.com/watch?v=${videoId}`;
      Linking.openURL(fallbackUrl).catch(err => {
        console.error('Failed to open YouTube:', err);
        Alert.alert('Error', 'Could not open YouTube. Please try again.');
      });
    }
  };

  if (!videoId) {
    return null;
  }

  // Improved HTML content with better error handling and load detection
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <meta http-equiv="Content-Security-Policy" content="default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; frame-src *; script-src * 'unsafe-inline' 'unsafe-eval';">
        <meta name="referrer" content="strict-origin-when-cross-origin">
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
          .error-message {
            display: none;
            color: #fff;
            text-align: center;
            padding: 20px;
          }
        </style>
        <script>
          var loadAttempts = 0;
          var maxAttempts = 3;
          var iframeLoaded = false;
          var errorDetected = false;
          
          function notifyReactNative(message) {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(message);
            }
          }
          
          function detectYouTubeError() {
            // Check for YouTube error messages in the page
            var errorIndicators = [
              'Error 153',
              'Video player configuration error',
              'Watch video on YouTube',
              'An error occurred',
              'This video is unavailable',
              'Playback on other websites has been disabled',
              'Embedding disabled',
              'The owner has disabled playback'
            ];
            
            // Check body text
            var bodyText = document.body.innerText || document.body.textContent || '';
            
            // Also check iframe content if accessible
            try {
              var iframe = document.getElementById('youtube-player');
              if (iframe && iframe.contentDocument) {
                var iframeText = iframe.contentDocument.body.innerText || iframe.contentDocument.body.textContent || '';
                bodyText += ' ' + iframeText;
              }
            } catch (e) {
              // Cross-origin, can't access
            }
            
            // Check for error indicators
            for (var i = 0; i < errorIndicators.length; i++) {
              if (bodyText.indexOf(errorIndicators[i]) !== -1) {
                if (!errorDetected) {
                  errorDetected = true;
                  notifyReactNative('YOUTUBE_ERROR_153');
                  return true;
                }
              }
            }
            
            // Also check for YouTube error page structure
            var errorElements = document.querySelectorAll('[class*="error"], [id*="error"], [class*="unavailable"]');
            if (errorElements.length > 0 && bodyText.toLowerCase().indexOf('youtube') !== -1) {
              if (!errorDetected && bodyText.length < 500) {
                errorDetected = true;
                notifyReactNative('YOUTUBE_ERROR_153');
                return true;
              }
            }
            
            return false;
          }
          
          function checkIframeLoad() {
            var iframe = document.getElementById('youtube-player');
            if (iframe) {
              if (detectYouTubeError()) {
                return;
              }
              
              try {
                var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                if (iframeDoc && iframeDoc.readyState === 'complete') {
                  if (!iframeLoaded && !errorDetected) {
                    iframeLoaded = true;
                    notifyReactNative('IFRAME_LOADED');
                  }
                }
              } catch (e) {
                if (detectYouTubeError()) {
                  return;
                }
                
                if (loadAttempts < maxAttempts) {
                  loadAttempts++;
                  setTimeout(checkIframeLoad, 2000);
                } else if (!iframeLoaded && !errorDetected) {
                  iframeLoaded = true;
                  notifyReactNative('IFRAME_LOADED');
                }
              }
            }
          }
          
          window.addEventListener('message', function(event) {
            if (event.data === 'requestFullscreen' || event.data === 'enterFullscreen' || 
                (event.data && event.data.type === 'fullscreen')) {
              notifyReactNative('FULLSCREEN_REQUESTED');
            }
          });
          
          window.addEventListener('load', function() {
            var iframe = document.getElementById('youtube-player');
            if (iframe) {
              iframe.addEventListener('load', function() {
                setTimeout(function() {
                  if (!detectYouTubeError()) {
                    notifyReactNative('IFRAME_LOADED');
                    setTimeout(checkIframeLoad, 1000);
                  }
                }, 2000);
              });
              
              setTimeout(checkIframeLoad, 2000);
              setTimeout(checkIframeLoad, 4000);
              setTimeout(checkIframeLoad, 6000);
            }
          });
          
          var errorCheckInterval = setInterval(function() {
            if (!iframeLoaded && !errorDetected) {
              detectYouTubeError();
            } else if (iframeLoaded || errorDetected) {
              clearInterval(errorCheckInterval);
            }
          }, 1000);
          
          setTimeout(function() {
            detectYouTubeError();
          }, 3000);
          
          if (document.readyState === 'complete') {
            notifyReactNative('PAGE_READY');
          } else {
            window.addEventListener('load', function() {
              notifyReactNative('PAGE_READY');
            });
          }
        </script>
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
              loading="eager"
              referrerpolicy="strict-origin-when-cross-origin"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
            ></iframe>
          </div>
        </div>
      </body>
    </html>
  `;

  const handleLoadEnd = () => {
    console.log('WebView load ended');
    setTimeout(() => {
      if (loading && !hasReceivedLoadSignal) {
        console.log('Hiding loader after load end timeout (no signal received)');
        setLoading(false);
      }
    }, 6000);
  };

  const handleLoadStart = () => {
    console.log('WebView load started');
    setError(null);
    setLoading(true);
    setHasReceivedLoadSignal(false);
  };

  const handleMessage = (event: any) => {
    try {
      const message = event.nativeEvent.data;
      console.log('Received message from WebView:', message);
      
      if (message === 'FULLSCREEN_REQUESTED') {
        handleFullscreen();
      } else if (message === 'YOUTUBE_ERROR_153') {
        console.log('YouTube Error 153 detected, retry count:', retryCount);
        
        if (loadTimeoutRef.current) {
          clearTimeout(loadTimeoutRef.current);
          loadTimeoutRef.current = null;
        }
        
        if (retryCount < 4) {
          console.log('Auto-retrying with different embed URL...');
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            setError(null);
            setLoading(true);
            setHasReceivedLoadSignal(false);
            
            if (webViewRef.current) {
              webViewRef.current.reload();
            }
          }, 500);
        } else {
          setError('Video player configuration error (Error 153). This video cannot be embedded due to security restrictions. Please watch on YouTube.');
          setLoading(false);
          setHasReceivedLoadSignal(true);
        }
      } else if (message === 'IFRAME_LOADED' || message === 'PAGE_READY') {
        console.log('Video loaded successfully');
        
        if (loadTimeoutRef.current) {
          clearTimeout(loadTimeoutRef.current);
          loadTimeoutRef.current = null;
        }
        
        setHasReceivedLoadSignal(true);
        setTimeout(() => {
          setLoading(false);
          setError(null);
        }, 1500);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  };

  const handleRetry = () => {
    if (retryCount < 4) {
      setRetryCount(prev => prev + 1);
      setError(null);
      setLoading(true);
      setHasReceivedLoadSignal(false);
      
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
      
      setTimeout(() => {
        if (webViewRef.current) {
          webViewRef.current.reload();
        }
      }, 100);
    } else {
      handleFullscreen();
    }
  };

  return (
    <ThemedView style={styles.container}>
      <PremiumHeader
        title={params.title as string || 'Video Player'}
        showBackButton={true}
        onBackPress={fromExplore ? () => router.push('/explore') : undefined}
        rightComponent={
          <TouchableOpacity onPress={handleToggleBookmark} style={{ padding: 4 }}>
            <IconSymbol 
              name={isBookmarked ? "bookmark.fill" : "bookmark"} 
              size={24} 
              color={isBookmarked ? ThemeColors.orange : ThemeColors.white} 
            />
          </TouchableOpacity>
        }
      />
      
      <View style={styles.playerContainer}>
        <WebView
          ref={webViewRef}
          key={retryCount}
          source={{ html: htmlContent }}
          style={styles.webview}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onMessage={handleMessage}
          allowsFullscreenVideo={false}
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          mixedContentMode="always"
          allowsInlineMediaPlayback={true}
          androidLayerType="hardware"
          cacheEnabled={true}
          incognito={false}
          thirdPartyCookiesEnabled={true}
          sharedCookiesEnabled={true}
          setSupportMultipleWindows={false}
          originWhitelist={['*']}
          userAgent={Platform.select({
            ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
            android: 'Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
          })}
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
            const url = request.url;
            
            if (url === 'about:blank' || url.startsWith('data:')) {
              return true;
            }
            
            if (url.includes('youtube.com/embed') || 
                url.includes('youtube-nocookie.com/embed') ||
                url.includes('youtube.com/api') ||
                url.includes('youtube-nocookie.com/api') ||
                url.includes('youtube.com/s/') ||
                url.includes('youtube.com/yts/') ||
                url.includes('youtube.com/gen_204') ||
                url.includes('google.com') ||
                url.includes('gstatic.com') ||
                url.includes('googlevideo.com') ||
                url.includes('ytimg.com')) {
              return true;
            }
            
            if (url.includes('youtube.com/watch') || 
                url.includes('youtu.be/') || 
                url.includes('youtube.com/channel') ||
                url.includes('youtube.com/user') ||
                (url.includes('youtube.com') && !url.includes('embed') && !url.includes('api') && !url.includes('s/'))) {
              handleFullscreen();
              return false;
            }
            
            return true;
          }}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error: ', nativeEvent);
            setError('Failed to load video. Please try again.');
            setTimeout(() => {
              setLoading(false);
            }, 2000);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView HTTP error: ', nativeEvent);
            if (nativeEvent.statusCode >= 400 && nativeEvent.statusCode < 500 && nativeEvent.statusCode !== 204) {
              setError('Video unavailable. Please try watching on YouTube.');
              setTimeout(() => {
                setLoading(false);
              }, 2000);
            }
          }}
        />
        
        {loading && !error && (
          <View style={styles.loader}>
            <View style={styles.loaderIconContainer}>
              <IconSymbol name="play.rectangle.fill" size={48} color={ThemeColors.orange} />
            </View>
            <ActivityIndicator size="large" color={ThemeColors.orange} style={styles.spinner} />
            <ThemedText style={styles.loadingText}>Loading video...</ThemedText>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <View style={styles.errorIconContainer}>
              <IconSymbol name="exclamationmark.triangle.fill" size={48} color={ThemeColors.orange} />
            </View>
            {error.includes('Error 153') && (
              <>
                <ThemedText style={styles.errorTitle}>Watch video on YouTube</ThemedText>
                <ThemedText style={styles.errorCode}>Error 153</ThemedText>
                <ThemedText style={styles.errorSubtitle}>Video player configuration error</ThemedText>
              </>
            )}
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <View style={styles.errorButtonRow}>
              {retryCount < 4 && (
                <TouchableOpacity
                  style={[styles.errorButton, styles.retryButton]}
                  onPress={handleRetry}
                  activeOpacity={0.8}>
                  <View style={[styles.errorButtonContainer, { backgroundColor: ThemeColors.deepBlue }]}>
                    <IconSymbol name="arrow.clockwise" size={20} color={ThemeColors.white} />
                    <ThemedText style={styles.errorButtonText}>Retry</ThemedText>
                  </View>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.errorButton}
                onPress={handleFullscreen}
                activeOpacity={0.8}>
                <View style={styles.errorButtonContainer}>
                  <IconSymbol name="play.circle.fill" size={20} color={ThemeColors.white} />
                  <ThemedText style={styles.errorButtonText}>Watch on YouTube</ThemedText>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!loading && !error && (
          <TouchableOpacity
            style={styles.fullscreenButton}
            onPress={handleFullscreen}
            activeOpacity={0.8}>
            <View style={styles.fullscreenButtonContainer}>
              <IconSymbol name="arrow.up.left.and.arrow.down.right" size={24} color={ThemeColors.white} />
              <ThemedText style={styles.fullscreenButtonText}>Watch on YouTube</ThemedText>
            </View>
          </TouchableOpacity>
        )}
      </View>
      
      {params.description && (
        <View style={styles.descriptionContainer}>
          <ThemedText style={styles.descriptionTitle}>Description</ThemedText>
          <ThemedText style={styles.descriptionText}>{params.description as string}</ThemedText>
        </View>
      )}

      <KeyboardAvoidingView 
        style={styles.chatContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.chatHeader}>
          <ThemedText style={styles.chatTitle}>Live Discussion</ThemedText>
        </View>
        <FlatList
          data={messages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.chatBubble}>
              <ThemedText style={styles.chatMessage}>{item.message}</ThemedText>
            </View>
          )}
          contentContainerStyle={styles.chatListContent}
          inverted={false}
        />
        <View style={styles.chatInputContainer}>
          <TextInput
            style={styles.chatInput}
            placeholder="Ask a question..."
            placeholderTextColor="#8E8E93"
            value={chatInput}
            onChangeText={setChatInput}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <IconSymbol name="paperplane.fill" size={20} color={ThemeColors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  fullscreenButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    zIndex: 20,
  },
  fullscreenButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ThemeColors.orange + 'E6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  fullscreenButtonText: {
    color: ThemeColors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    zIndex: 15,
    padding: 20,
  },
  errorIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: ThemeColors.orange + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    color: ThemeColors.lightNeutral,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    textDecorationLine: 'underline',
  },
  errorCode: {
    color: ThemeColors.lightNeutral,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  errorSubtitle: {
    color: ThemeColors.lightNeutral,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.8,
  },
  errorText: {
    color: ThemeColors.lightNeutral,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButtonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  errorButton: {
    borderRadius: 24,
    overflow: 'hidden',
    minWidth: 160,
  },
  retryButton: {
    backgroundColor: ThemeColors.deepBlue,
  },
  errorButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ThemeColors.orange,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  errorButtonText: {
    color: ThemeColors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    marginTop: 8,
  },
  chatHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: ThemeColors.lightNeutral,
  },
  chatListContent: {
    padding: 16,
    gap: 12,
  },
  chatBubble: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    alignSelf: 'flex-start',
    maxWidth: '85%',
  },
  chatMessage: {
    color: ThemeColors.white,
    fontSize: 14,
  },
  chatInputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#222',
    borderTopWidth: 1,
    borderTopColor: '#333',
    alignItems: 'center',
    gap: 12,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: ThemeColors.white,
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ThemeColors.orange,
    justifyContent: 'center',
    alignItems: 'center',
  },
});