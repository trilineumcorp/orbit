import { Link, usePathname } from 'expo-router';
import { Platform, StyleSheet, TouchableOpacity, View, Dimensions } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;
const isDesktop = width >= 1024;

interface NavItem {
  name: string;
  href: string;
  icon: string;
  label: string;
}

const studentNavItems: NavItem[] = [
  { name: 'Home', href: '/', icon: 'house.fill', label: 'Home' },
  { name: 'Explore', href: '/explore', icon: 'square.grid.2x2.fill', label: 'Explore' },
  { name: 'Videos', href: '/videos', icon: 'play.rectangle.fill', label: 'Videos' },
  { name: 'Exams', href: '/exams', icon: 'doc.text.fill', label: 'Exams' },
  { name: 'Reports', href: '/reports', icon: 'chart.bar.fill', label: 'Reports' },
];

const adminNavItems: NavItem[] = [
  { name: 'Students', href: '/students', icon: 'person.2.fill', label: 'Students' },
  { name: 'Exams', href: '/exams', icon: 'doc.text.fill', label: 'Exams' },
  { name: 'Content', href: '/content', icon: 'book.fill', label: 'Content' },
  { name: 'Reports', href: '/reports', icon: 'chart.bar.fill', label: 'Reports' },
];

interface BottomNavbarProps {
  role?: 'student' | 'admin';
}

export function BottomNavbar({ role = 'student' }: BottomNavbarProps) {
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const navItems = role === 'student' ? studentNavItems : adminNavItems;

  // Get the base path (remove route group prefix if present)
  const getBasePath = (path: string) => {
    if (path.startsWith('/(student)') || path.startsWith('/(admin)')) {
      return path.replace(/^\/\(student\)|\/\(admin\)/, '') || '/';
    }
    return path;
  };

  const currentPath = getBasePath(pathname);

  // For admin, show 4 icons with better spacing
  const isAdmin = role === 'admin';
  const activeColor = role === 'student' ? ThemeColors.orange : '#FF6B35';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colorScheme === 'dark' ? '#1A3D4D' : '#FFFFFF',
          borderTopColor: colorScheme === 'dark' ? '#2A4D5D' : '#E0E0E0',
          paddingBottom: Platform.OS === 'ios' ? (isTablet ? 20 : 10) : 10,
          paddingTop: isTablet ? 12 : 8,
          paddingHorizontal: isAdmin ? (isTablet ? 24 : 12) : 0,
        },
      ]}>
      {navItems.map((item, index) => {
        const isActive = currentPath === item.href || (item.href === '/' && currentPath === '/');

        return (
          <Link key={item.name} href={item.href as any} asChild>
            <TouchableOpacity
              style={[
                styles.navItem,
                {
                  paddingHorizontal: isAdmin 
                    ? (isTablet ? 20 : 12) 
                    : (isTablet ? 16 : 8),
                  flex: isAdmin ? 1 : 1,
                  maxWidth: isAdmin && !isTablet ? '25%' : 'none',
                },
              ]}
              activeOpacity={0.7}>
              <View 
                style={[
                  styles.navItemContent,
                  isActive && isAdmin && styles.activeNavItemContainer,
                  {
                    paddingVertical: isAdmin ? (isTablet ? 10 : 8) : 0,
                    paddingHorizontal: isAdmin && isActive ? (isTablet ? 16 : 12) : 0,
                    borderRadius: isAdmin && isActive ? (isTablet ? 16 : 12) : 0,
                    backgroundColor: isActive && isAdmin 
                      ? (colorScheme === 'dark' ? 'rgba(255, 107, 53, 0.15)' : 'rgba(255, 107, 53, 0.1)')
                      : 'transparent',
                  },
                ]}>
                <View
                  style={[
                    styles.iconContainer,
                    {
                      width: isTablet ? 44 : 40,
                      height: isTablet ? 44 : 40,
                      borderRadius: isTablet ? 22 : 20,
                      backgroundColor: isActive && isAdmin
                        ? (colorScheme === 'dark' ? 'rgba(255, 107, 53, 0.2)' : 'rgba(255, 107, 53, 0.15)')
                        : 'transparent',
                      justifyContent: 'center',
                      alignItems: 'center',
                    },
                  ]}>
                  <IconSymbol
                    name={item.icon as any}
                    size={isTablet ? 28 : 24}
                    color={isActive ? activeColor : colorScheme === 'dark' ? '#8E8E93' : '#6E6E73'}
                  />
                </View>
                {isAdmin && (
                  <View
                    style={[
                      styles.labelContainer,
                      {
                        marginTop: isTablet ? 6 : 4,
                      },
                    ]}>
                    <View
                      style={[
                        styles.activeIndicator,
                        {
                          backgroundColor: isActive ? activeColor : 'transparent',
                          width: isTablet ? 36 : 28,
                          height: isTablet ? 3 : 2.5,
                        },
                      ]}
                    />
                  </View>
                )}
                {!isAdmin && (
                  <View
                    style={[
                      styles.labelContainer,
                      {
                        marginTop: isTablet ? 6 : 4,
                      },
                    ]}>
                    <View
                      style={[
                        styles.activeIndicator,
                        {
                          backgroundColor: isActive ? activeColor : 'transparent',
                          width: isTablet ? 40 : 32,
                          height: isTablet ? 4 : 3,
                        },
                      ]}
                    />
                  </View>
                )}
                {isTablet && (
                  <View style={styles.labelText}>
                    <ThemedText
                      style={[
                        styles.label,
                        {
                          color: isActive ? activeColor : colorScheme === 'dark' ? '#8E8E93' : '#6E6E73',
                          fontSize: isDesktop ? 14 : 12,
                          fontWeight: isActive ? '700' : '600',
                        },
                      ]}>
                      {item.label}
                    </ThemedText>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </Link>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    borderTopWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0, // Allow flex items to shrink below content size
  },
  navItemContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    transition: 'all 0.2s ease',
  },
  activeNavItemContainer: {
    // Additional styling for active admin nav items
  },
  iconContainer: {
    // Container for icon with background
  },
  labelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  activeIndicator: {
    borderRadius: 2,
    transition: 'all 0.2s ease',
  },
  labelText: {
    marginTop: 4,
  },
  label: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

