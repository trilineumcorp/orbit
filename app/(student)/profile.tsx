import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Dimensions, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ThemeColors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/avatar';
import { ProfileSkeleton } from '@/components/skeleton';
import { detectNetworkSpeed, getMinLoadingTime } from '@/utils/network';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

export default function StudentProfileScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [loading, setLoading] = useState(!user);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phoneNumber || '');
      setLoading(false);
    } else {
      // Load user data if not available
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      let minLoadingTime = 300; // Default minimum loading time
      
      try {
        const networkSpeed = await detectNetworkSpeed();
        minLoadingTime = getMinLoadingTime(networkSpeed);
      } catch (networkError) {
        console.warn('Network speed detection failed, using default:', networkError);
      }
      
      // Simulate loading time for better UX
      await new Promise(resolve => setTimeout(resolve, minLoadingTime));
      
      // User data should be loaded from AuthContext
      setLoading(false);
    } catch (error) {
      console.error('Failed to load user data:', error);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const updatedUser = await updateUser({
        name,
        phoneNumber: phone,
      });
      
      if (updatedUser) {
        setName(updatedUser.name || '');
        setPhone(updatedUser.phoneNumber || '');
      }
      
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      console.error('Profile update error:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPhone(user?.phoneNumber || '');
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={[styles.header, isDark && styles.headerDark]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <IconSymbol
              name="chevron.left"
              size={24}
              color={isDark ? ThemeColors.lightNeutral : ThemeColors.deepBlue}
            />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>My Profile</ThemedText>
          {isEditing ? (
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                <ThemedText style={styles.saveButtonText}>Save</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
              <ThemedText style={styles.editButtonText}>Edit</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {loading ? (
            <ProfileSkeleton />
          ) : (
            <>
              {/* Avatar Section */}
              <View style={styles.avatarSection}>
            <Avatar
              name={user?.name}
              email={user?.email}
              avatarUrl={user?.avatarUrl}
              size="large"
              showBorder={true}
              borderColor={ThemeColors.orange}
            />
            {!isEditing && (
              <TouchableOpacity style={styles.cameraButton}>
                <IconSymbol name="camera.fill" size={16} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Profile Information */}
          <View style={styles.infoSection}>
            <View style={[styles.infoItem, isDark && styles.infoItemDark]}>
              <View style={styles.infoItemHeader}>
                <IconSymbol name="person.fill" size={18} color={ThemeColors.orange} />
                <ThemedText style={styles.label}>Name</ThemedText>
              </View>
              {isEditing ? (
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor={isDark ? '#999' : '#999'}
                />
              ) : (
                <ThemedText style={styles.value}>{user?.name || 'Not set'}</ThemedText>
              )}
            </View>

            <View style={[styles.infoItem, isDark && styles.infoItemDark]}>
              <View style={styles.infoItemHeader}>
                <IconSymbol name="envelope.fill" size={18} color={ThemeColors.deepBlue} />
                <ThemedText style={styles.label}>Email</ThemedText>
              </View>
              <ThemedText style={styles.value}>{user?.email || 'Not set'}</ThemedText>
            </View>

            <View style={[styles.infoItem, isDark && styles.infoItemDark]}>
              <View style={styles.infoItemHeader}>
                <IconSymbol name="phone.fill" size={18} color={ThemeColors.orange} />
                <ThemedText style={styles.label}>Phone Number</ThemedText>
              </View>
              {isEditing ? (
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter phone number"
                  placeholderTextColor={isDark ? '#999' : '#999'}
                  keyboardType="phone-pad"
                />
              ) : (
                <ThemedText style={styles.value}>{user?.phoneNumber || 'Not set'}</ThemedText>
              )}
            </View>

            <View style={[styles.infoItem, isDark && styles.infoItemDark]}>
              <View style={styles.infoItemHeader}>
                <IconSymbol name="person.badge.fill" size={18} color={ThemeColors.deepBlue} />
                <ThemedText style={styles.label}>Role</ThemedText>
              </View>
              <View style={styles.roleBadge}>
                <ThemedText style={styles.roleText}>
                  {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student'}
                </ThemedText>
              </View>
            </View>
          </View>
            </>
          )}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? (isTablet ? 20 : 16) : (isTablet ? 16 : 12),
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerDark: {
    backgroundColor: '#1A3D4D',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  editButtonText: {
    color: ThemeColors.orange,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: ThemeColors.orange,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ThemeColors.orange,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  infoSection: {
    gap: 16,
  },
  infoItem: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  infoItemDark: {
    backgroundColor: '#2A4D5D',
  },
  infoItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    fontSize: 16,
    fontWeight: '500',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  inputDark: {
    backgroundColor: '#1A3D4D',
    borderColor: '#3A5D6D',
    color: '#FFFFFF',
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: ThemeColors.orange + '20',
  },
  roleText: {
    color: ThemeColors.orange,
    fontSize: 14,
    fontWeight: '700',
  },
});

