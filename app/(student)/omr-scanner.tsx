import { PremiumHeader } from '@/components/premium-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getOMRResults, saveOMRResult } from '@/services/storage';
import { OMRResult } from '@/types';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

// Lazy load ImagePicker to avoid crashes if native module isn't available
let ImagePicker: typeof import('expo-image-picker') | null = null;
const loadImagePicker = async () => {
  if (!ImagePicker) {
    try {
      ImagePicker = await import('expo-image-picker');
    } catch (error) {
      console.warn('expo-image-picker not available:', error);
      return null;
    }
  }
  return ImagePicker;
};

export default function OMRScannerScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [results, setResults] = useState<OMRResult[]>([]);
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [examName, setExamName] = useState('');
  
  const fromExplore = params.from === 'explore';

  React.useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    const loadedResults = await getOMRResults();
    setResults(loadedResults);
  };

  const pickImage = async () => {
    const picker = await loadImagePicker();
    if (!picker) {
      Alert.alert('Error', 'Image picker is not available. Please rebuild the app with native modules.');
      return;
    }

    try {
      const result = await picker.launchImageLibraryAsync({
        mediaTypes: picker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setScannedImage(result.assets[0].uri);
        setShowCamera(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePicture = async () => {
    // For CameraView, we'll use ImagePicker as fallback
    // In production, you'd use the camera's capture functionality
    const picker = await loadImagePicker();
    if (!picker) {
      Alert.alert('Error', 'Camera is not available. Please rebuild the app with native modules.');
      setShowCamera(false);
      return;
    }

    try {
      const result = await picker.launchCameraAsync({
        mediaTypes: picker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setScannedImage(result.assets[0].uri);
        setShowCamera(false);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture. Please try again.');
      setShowCamera(false);
    }
  };

  const processOMR = async () => {
    if (!scannedImage || !studentName || !rollNumber || !examName) {
      Alert.alert('Error', 'Please fill in all fields and scan an OMR sheet');
      return;
    }

    // In a real implementation, you would process the image here
    // For now, we'll create a mock result
    const mockResult: OMRResult = {
      id: Date.now().toString(),
      studentName,
      rollNumber,
      examName,
      score: Math.floor(Math.random() * 50) + 1,
      totalQuestions: 50,
      scannedAt: new Date(),
      answers: Array.from({ length: 50 }, (_, i) => ({
        questionNumber: i + 1,
        selectedOption: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)] as 'A' | 'B' | 'C' | 'D',
        isCorrect: Math.random() > 0.5,
      })),
    };

    await saveOMRResult(mockResult);
    await loadResults();
    setScannedImage(null);
    setStudentName('');
    setRollNumber('');
    setExamName('');
    Alert.alert('Success', 'OMR sheet processed successfully');
  };

  if (!permission) {
    return <ThemedView style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.container}>
        <PremiumHeader 
          title="OMR Scanner" 
          showBackButton={true}
          onBackPress={fromExplore ? () => router.push('/explore') : undefined}
        />
        <View style={styles.permissionContainer}>
          <IconSymbol name="camera.fill" size={64} color={ThemeColors.orange} />
          <ThemedText style={styles.message}>We need your permission to use the camera</ThemedText>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: ThemeColors.orange }]}
            onPress={requestPermission}
            activeOpacity={0.8}>
            <ThemedText style={{ color: ThemeColors.white, fontWeight: '600' }}>Grant Permission</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  const colors = Colors[colorScheme ?? 'light'];

  if (showCamera) {
    return (
      <ThemedView style={styles.container}>
        <CameraView style={styles.camera} facing="back">
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={[styles.cameraButton, { backgroundColor: ThemeColors.deepBlue }]}
              onPress={() => setShowCamera(false)}
              activeOpacity={0.8}>
              <IconSymbol name="xmark" size={24} color={ThemeColors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.captureButton, { backgroundColor: ThemeColors.orange }]}
              onPress={takePicture}
              activeOpacity={0.8}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cameraButton, { backgroundColor: ThemeColors.deepBlue }]}
              onPress={pickImage}
              activeOpacity={0.8}>
              <IconSymbol name="photo" size={24} color={ThemeColors.white} />
            </TouchableOpacity>
          </View>
        </CameraView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <PremiumHeader 
        title="OMR Scanner" 
        showBackButton={true}
        onBackPress={fromExplore ? () => router.push('/explore') : undefined}
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        
        <ThemedView style={[styles.welcomeCard, { backgroundColor: colors.card }]}>
          <LinearGradient
            colors={[ThemeColors.deepBlue + '20', ThemeColors.orange + '20']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.welcomeGradient}>
            <View style={styles.welcomeContent}>
              <View style={[styles.welcomeIconContainer, { backgroundColor: ThemeColors.deepBlue + '30' }]}>
                <IconSymbol name="camera.fill" size={40} color={ThemeColors.deepBlue} />
              </View>
              <ThemedText type="title" style={styles.welcomeTitle}>
                OMR Scanner
              </ThemedText>
              <ThemedText style={styles.welcomeDescription}>
                Scan and check OMR sheets instantly to get instant results and feedback
              </ThemedText>
            </View>
          </LinearGradient>
        </ThemedView>

        <ThemedView style={[styles.formCard, { backgroundColor: colors.card }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Student Information
          </ThemedText>
          <View style={[styles.inputContainer, { borderColor: colors.border }]}>
            <IconSymbol name="person.fill" size={20} color={colors.icon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Student Name"
              placeholderTextColor={colors.icon}
              value={studentName}
              onChangeText={setStudentName}
            />
          </View>
          <View style={[styles.inputContainer, { borderColor: colors.border }]}>
            <IconSymbol name="number" size={20} color={colors.icon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Roll Number"
              placeholderTextColor={colors.icon}
              value={rollNumber}
              onChangeText={setRollNumber}
            />
          </View>
          <View style={[styles.inputContainer, { borderColor: colors.border }]}>
            <IconSymbol name="doc.text.fill" size={20} color={colors.icon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Exam Name"
              placeholderTextColor={colors.icon}
              value={examName}
              onChangeText={setExamName}
            />
          </View>
        </ThemedView>

        <ThemedView style={[styles.formCard, { backgroundColor: colors.card }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Scan OMR Sheet
          </ThemedText>
          {scannedImage ? (
            <View>
              <Image source={{ uri: scannedImage }} style={styles.scannedImage} />
              <TouchableOpacity
                style={[styles.button, { backgroundColor: ThemeColors.orange, marginTop: 16 }]}
                onPress={processOMR}
                activeOpacity={0.8}>
                <IconSymbol name="checkmark.circle.fill" size={20} color={ThemeColors.white} />
                <ThemedText style={{ color: ThemeColors.white, fontWeight: '600', marginLeft: 8 }}>Process OMR</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.border, marginTop: 12 }]}
                onPress={() => setScannedImage(null)}
                activeOpacity={0.8}>
                <IconSymbol name="arrow.clockwise" size={20} color={colors.text} />
                <ThemedText style={{ fontWeight: '600', marginLeft: 8 }}>Rescan</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.scanButtons}>
              <TouchableOpacity
                style={[styles.scanButton, { backgroundColor: ThemeColors.orange }]}
                onPress={() => setShowCamera(true)}
                activeOpacity={0.8}>
                <View style={styles.scanButtonIconContainer}>
                  <IconSymbol name="camera.fill" size={36} color={ThemeColors.white} />
                </View>
                <ThemedText style={{ color: ThemeColors.white, marginTop: 12, fontWeight: '600' }}>Take Photo</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.scanButton, { backgroundColor: ThemeColors.deepBlue }]}
                onPress={pickImage}
                activeOpacity={0.8}>
                <View style={styles.scanButtonIconContainer}>
                  <IconSymbol name="photo.fill" size={36} color={ThemeColors.white} />
                </View>
                <ThemedText style={{ color: ThemeColors.white, marginTop: 12, fontWeight: '600' }}>Pick from Gallery</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </ThemedView>

        {results.length > 0 && (
          <ThemedView style={styles.resultsSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Recent Scans
            </ThemedText>
            {results.slice(0, 5).map(result => (
              <Link
                key={result.id}
                href={{
                  pathname: '/omr-result',
                  params: { resultId: result.id },
                }}
                asChild>
                <TouchableOpacity
                  style={[styles.resultCard, { backgroundColor: colors.card }]}
                  activeOpacity={0.7}>
                  <View style={styles.resultInfo}>
                    <ThemedText type="defaultSemiBold" style={{ fontSize: 16, fontWeight: '700' }}>
                      {result.studentName}
                    </ThemedText>
                    <ThemedText style={styles.resultDetails}>{result.examName}</ThemedText>
                    <ThemedText style={styles.resultDetails}>
                      Score: {result.score}/{result.totalQuestions}
                    </ThemedText>
                  </View>
                  <IconSymbol name="chevron.right" size={20} color={colors.icon} />
                </TouchableOpacity>
              </Link>
            ))}
          </ThemedView>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
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
  formCard: {
    padding: 24,
    borderRadius: 20,
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
  sectionTitle: {
    marginBottom: 20,
    fontWeight: '700',
    fontSize: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    gap: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '500',
  },
  scanButtons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  scanButton: {
    flex: 1,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  scanButtonIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannedImage: {
    width: '100%',
    height: 320,
    borderRadius: 16,
    resizeMode: 'contain',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  button: {
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
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
  camera: {
    flex: 1,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 50,
    paddingHorizontal: 20,
  },
  cameraButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: ThemeColors.white,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: ThemeColors.white,
  },
  resultsSection: {
    marginTop: 8,
  },
  resultCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
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
  resultInfo: {
    flex: 1,
  },
  resultDetails: {
    fontSize: 14,
    marginTop: 6,
    opacity: 0.7,
    fontWeight: '500',
  },
});

