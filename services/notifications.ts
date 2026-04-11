// import * as Device from 'expo-device';
// import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { apiService } from './api';
import Constants from 'expo-constants';

// Set how notifications are handled when the app is in foreground
/*
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
*/

export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token;

  if (Platform.OS === 'android') {
    /*
    Notifications.setNotificationChannelAsync('default', {
      name: 'Orbit Updates',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B35',
    });
    */
  }

  /*
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.warn('User denied push notification permissions.');
      return undefined;
    }
    
    try {
      // Get the Expo Push Token
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
        
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      
      console.log('Successfully acquired Expo Push Token!');
      
    } catch (e) {
      console.error('Error getting push token', e);
    }
  } else {
    console.warn('Push Notifications require a physical device.');
  }
  */

  return token;
}

export async function sendPushTokenToBackend(pushToken: string): Promise<void> {
  try {
    const response = await apiService.put('/auth/push-token', { pushToken }, true);
    if (response.success) {
      console.log('Successfully synced push token with backend!');
    }
  } catch (error) {
    console.error('Failed to sync push token with backend:', error);
  }
}
