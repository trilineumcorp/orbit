import React from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemeColors } from '@/constants/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export function CustomSplashScreen() {
  return (
    <View style={styles.container}>
      {/* Main Logo - Larger Size in Upper Half */}
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/logo.jpg')}
          style={styles.mainLogo}
          resizeMode="contain"
        />
      </View>

      {/* Powered By Section in Lower Half */}
      <View style={styles.poweredByContainer}>
        <ThemedText style={styles.poweredByText}>Powered By</ThemedText>
        <View style={styles.trilineumLogoContainer}>
          <Image
            source={require('@/assets/images/trilineum/trilineumlogo.png')}
            style={styles.trilineumLogo}
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: screenHeight * 0.15, // Top padding for logo
    paddingBottom: screenHeight * 0.12, // Bottom padding for Powered By section
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    paddingTop: 20,
  },
  mainLogo: {
    width: screenWidth * 0.8, // Increased size - 80% of screen width for stunning effect
    height: screenWidth * 0.8,
    maxWidth: 500,
    maxHeight: 500,
  },
  poweredByContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    paddingBottom: 20,
  },
  poweredByText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  trilineumLogoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  trilineumLogo: {
    width: screenWidth * 0.35, // 35% of screen width
    height: screenWidth * 0.16,
    maxWidth: 200,
    maxHeight: 90,
  },
});

