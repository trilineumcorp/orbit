import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ThemeColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Avatar } from '@/components/avatar';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

export default function AdminProfileScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const colorScheme = useColorScheme();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');

  // Update local state when user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phoneNumber || '');
    }
  }, [user]);

  const isDark = colorScheme === 'dark';

  const handleSave = async () => {
    try {
      const updatedUser = await updateUser({
        name,
        phoneNumber: phone,
      });
      
      // Update local state with the updated user data
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
            onPress={() => router.push('/(admin)/')}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <IconSymbol
              name="chevron.left"
              size={24}
              color={isDark ? ThemeColors.lightNeutral : ThemeColors.deepBlue}
            />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>My Profile</ThemedText>
          {!isEditing ? (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
              activeOpacity={0.7}>
              <ThemedText style={styles.editButtonText}>Edit</ThemedText>
            </TouchableOpacity>
          ) : (
            <View style={styles.editButton} />
          )}
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <Avatar
              name={user?.name}
              email={user?.email}
              avatarUrl={user?.avatarUrl}
              size="xlarge"
              showBorder={true}
            />
            {isEditing && (
              <TouchableOpacity style={styles.changePhotoButton}>
                <ThemedText style={styles.changePhotoText}>Change Photo</ThemedText>
              </TouchableOpacity>
            )}
          </View>

          {/* Profile Information */}
          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <ThemedText style={styles.label}>Name</ThemedText>
              {isEditing ? (
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor={isDark ? '#888' : '#999'}
                />
              ) : (
                <ThemedText style={styles.value}>{user?.name || 'Not set'}</ThemedText>
              )}
            </View>

            <View style={styles.infoItem}>
              <ThemedText style={styles.label}>Email</ThemedText>
              <ThemedText style={[styles.value, styles.disabledValue]}>
                {user?.email || 'Not set'}
              </ThemedText>
              <ThemedText style={styles.hint}>Email cannot be changed</ThemedText>
            </View>

            <View style={styles.infoItem}>
              <ThemedText style={styles.label}>Phone Number</ThemedText>
              {isEditing ? (
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter phone number"
                  placeholderTextColor={isDark ? '#888' : '#999'}
                  keyboardType="phone-pad"
                />
              ) : (
                <ThemedText style={styles.value}>
                  {user?.phoneNumber || 'Not set'}
                </ThemedText>
              )}
            </View>

            <View style={styles.infoItem}>
              <ThemedText style={styles.label}>Role</ThemedText>
              <ThemedText style={styles.value}>{user?.role || 'Admin'}</ThemedText>
            </View>

            <View style={styles.infoItem}>
              <ThemedText style={styles.label}>Account Status</ThemedText>
              <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
                <ThemedText style={styles.value}>Active</ThemedText>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          {isEditing && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}>
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}>
                <LinearGradient
                  colors={[ThemeColors.deepBlue, ThemeColors.deepBlue + 'DD']}
                  style={styles.gradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}>
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
    borderBottomColor: '#2A4D5D',
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
  editButton: {
    width: 50,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    color: ThemeColors.orange,
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  changePhotoButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  changePhotoText: {
    color: ThemeColors.orange,
    fontSize: 14,
    fontWeight: '600',
  },
  infoSection: {
    gap: 20,
  },
  infoItem: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.7,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  disabledValue: {
    opacity: 0.6,
  },
  hint: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 4,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputDark: {
    backgroundColor: '#2A4D5D',
    borderColor: '#3A5D6D',
    color: '#FFF',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  gradientButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

