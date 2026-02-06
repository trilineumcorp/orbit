import { useRouter } from 'expo-router';
import {
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { ThemeColors } from '@/constants/theme';
import { Avatar } from '@/components/avatar';

interface ProfileMenuProps {
  user?: {
    name?: string;
    email?: string;
    role?: string;
    avatarUrl?: string | null;
  };
}

export function ProfileMenu({ user }: ProfileMenuProps) {
  const router = useRouter();

  const handlePress = () => {
    if (user?.role === 'student') {
      router.push('/(student)/profile-menu');
    } else {
      // For admin, you can add a profile-menu screen later if needed
      router.push('/(admin)/profile');
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.profileButton}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <Avatar
        name={user?.name}
        email={user?.email}
        avatarUrl={user?.avatarUrl}
        size="small"
        showBorder={true}
        borderColor={ThemeColors.lightNeutral}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  profileButton: {
    padding: Platform.OS === 'ios' ? 8 : 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

