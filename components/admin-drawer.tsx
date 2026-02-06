import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemeColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Avatar } from '@/components/avatar';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;
const isDesktop = screenWidth >= 1024;

interface DrawerItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  onPress?: () => void;
}

interface AdminDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export function AdminDrawer({ visible, onClose }: AdminDrawerProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleNavigation = (route: string) => {
    onClose();
    router.push(route as any);
  };

  const handleLogout = () => {
    onClose();
    logout();
    router.replace('/auth/login');
  };

  const menuItems: DrawerItem[] = [
    {
      id: 'profile',
      label: 'My Profile',
      icon: 'person.fill',
      route: '/(admin)/profile',
    },
    {
      id: 'students',
      label: 'Manage Students',
      icon: 'person.2.fill',
      route: '/(admin)/students',
    },
    {
      id: 'exams',
      label: 'Manage Exams',
      icon: 'doc.text.fill',
      route: '/(admin)/exams',
    },
    {
      id: 'content',
      label: 'Manage Content',
      icon: 'folder.fill',
      route: '/(admin)/content',
    },
    {
      id: 'reports',
      label: 'View Reports',
      icon: 'chart.bar.fill',
      route: '/(admin)/reports',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: 'bell.fill',
      route: '/(admin)/notifications',
    },
    {
      id: 'support',
      label: 'Customer Support',
      icon: 'target',
      route: '/(admin)/support',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'gearshape.fill',
      route: '/(admin)/settings',
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContainer}>
              {/* Light Grey Card - Contains Profile and Menu Items */}
              <View style={styles.contentCard}>
                {/* User Profile Section */}
                <View style={styles.profileSection}>
                  <Avatar
                    name={user?.name}
                    email={user?.email}
                    avatarUrl={user?.avatarUrl}
                    size="large"
                    showBorder={false}
                  />
                  <View style={styles.profileTextContainer}>
                    <ThemedText style={styles.profileName}>
                      {user?.name || 'Admin'}
                    </ThemedText>
                    <ThemedText style={styles.profileTagline}>
                      Power of knowledge
                    </ThemedText>
                  </View>
                </View>

                {/* Menu Items */}
                <View style={styles.menuSection}>
                  {menuItems.map((item, index) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.menuItem}
                      onPress={() => {
                        if (item.route) {
                          handleNavigation(item.route);
                        } else if (item.onPress) {
                          item.onPress();
                        }
                      }}
                      activeOpacity={0.7}>
                      <IconSymbol
                        name={item.icon as any}
                        size={isTablet ? 22 : 20}
                        color="#333333"
                      />
                      <ThemedText style={styles.menuLabel}>{item.label}</ThemedText>
                    </TouchableOpacity>
                  ))}

                  {/* Logout Button */}
                  <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    activeOpacity={0.7}>
                    <IconSymbol
                      name="arrow.right.square.fill"
                      size={isTablet ? 22 : 20}
                      color="#333333"
                    />
                    <ThemedText style={styles.logoutLabel}>
                      Logout
                    </ThemedText>
                  </TouchableOpacity>
                </View>

                {/* Footer Information */}
                <View style={styles.footerSection}>
                  <View style={styles.footerItem}>
                    <IconSymbol
                      name="doc.text.fill"
                      size={isTablet ? 16 : 14}
                      color="#4CAF50"
                    />
                    <ThemedText style={styles.footerText}>14 exams</ThemedText>
                  </View>
                  <View style={styles.footerItem}>
                    <IconSymbol
                      name="video.fill"
                      size={isTablet ? 16 : 14}
                      color="#4CAF50"
                    />
                    <ThemedText style={styles.footerText}>10 live classes</ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: isTablet ? 24 : 16,
  },
  modalContainer: {
    width: isDesktop ? 420 : isTablet ? 380 : screenWidth * 0.9,
    maxWidth: 420,
    borderRadius: isTablet ? 40 : 40,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: isTablet ? 28 : 24,
    paddingTop: isTablet ? 24 : 20,
    paddingBottom: isTablet ? 20 : 16,
    paddingHorizontal: isTablet ? 20 : 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isTablet ? 16 : 12,
    marginBottom: isTablet ? 20 : 16,
  },
  profileTextContainer: {
    flex: 1,
    gap: isTablet ? 4 : 2,
  },
  profileName: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: '700',
    color: '#333',
  },
  profileTagline: {
    fontSize: isTablet ? 14 : 13,
    fontWeight: '400',
    color: '#666',
  },
  menuSection: {
    width: '100%',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: isTablet ? 18 : 16,
    paddingVertical: isTablet ? 14 : 12,
    gap: isTablet ? 16 : 14,
    borderRadius: isTablet ? 100 : 100,
    backgroundColor: '#F5F5F5',
    marginBottom: isTablet ? 6 : 5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  menuLabel: {
    flex: 1,
    fontSize: isTablet ? 16 : 15,
    fontWeight: '600',
    color: '#333333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: isTablet ? 18 : 16,
    paddingVertical: isTablet ? 14 : 12,
    gap: isTablet ? 16 : 14,
    borderRadius: isTablet ? 14 : 12,
    backgroundColor: '#FFFFFF',
    marginTop: isTablet ? 6 : 5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  logoutLabel: {
    flex: 1,
    fontSize: isTablet ? 16 : 15,
    fontWeight: '600',
    color: '#333333',
  },
  footerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isTablet ? 24 : 20,
    marginTop: isTablet ? 16 : 12,
    paddingTop: isTablet ? 12 : 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isTablet ? 8 : 6,
  },
  footerText: {
    fontSize: isTablet ? 14 : 13,
    fontWeight: '500',
    color: '#666666',
  },
});

