import React from 'react';
import { View, StyleSheet, Image, Dimensions, Text } from 'react-native';
import { ThemeColors } from '@/constants/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export function CustomSplashScreen() {
  return (
    <View style={styles.container}>
      {/* Main Logo - Centered */}
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.mainLogo}
          resizeMode="contain"
        />
        
        {/* "From" Text */}
        <Text style={styles.fromText}>From</Text>
        
        {/* Trilineum Logo */}
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  mainLogo: {
    width: screenWidth * 0.7, // 70% of screen width
    height: screenWidth * 0.7,
    maxWidth: 400,
    maxHeight: 400,
    marginBottom: 30,
  },
  fromText: {
    fontSize: 18,
    color: ThemeColors.grayText,
    fontWeight: '500',
    marginTop: 10,
  },
  trilineumLogoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    // marginTop: 10,
  },
  trilineumLogo: {
    width: screenWidth * 0.4, // 40% of screen width
    height: screenWidth * 0.15,
    maxWidth: 200,
    maxHeight: 80,
  },
});

