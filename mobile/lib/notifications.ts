import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationToken {
  token: string;
  type: 'expo' | 'apns' | 'fcm';
}

export async function registerForPushNotificationsAsync(): Promise<NotificationToken | null> {
  let token: string | undefined;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });

    // Create delivery notifications channel
    await Notifications.setNotificationChannelAsync('deliveries', {
      name: 'Delivery Notifications',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0066CC',
      description: 'Notifications about package deliveries',
    });

    // Create maintenance notifications channel
    await Notifications.setNotificationChannelAsync('maintenance', {
      name: 'Maintenance Notifications',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B35',
      description: 'Notifications about maintenance requests and updates',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    try {
      // Get Expo push token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      if (!projectId) {
        throw new Error('Project ID not found');
      }

      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;

      console.log('Expo push token:', token);

      return {
        token,
        type: 'expo',
      };
    } catch (error) {
      console.error('Error getting Expo push token:', error);

      try {
        // Fallback to device push token
        const deviceToken = await Notifications.getDevicePushTokenAsync();
        console.log('Device push token:', deviceToken);

        return {
          token: deviceToken.data,
          type: deviceToken.type === 'apns' ? 'apns' : 'fcm',
        };
      } catch (deviceError) {
        console.error('Error getting device push token:', deviceError);
        return null;
      }
    }
  } else {
    console.log('Must use physical device for Push Notifications');
    return null;
  }
}

export function addNotificationReceivedListener(
  listener: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(listener);
}

export function addNotificationResponseReceivedListener(
  listener: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(listener);
}

export async function scheduleLocalNotification(title: string, body: string, data?: any, scheduledTime?: Date) {
  const notificationContent: Notifications.NotificationContentInput = {
    title,
    body,
    data,
    sound: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  };

  if (scheduledTime) {
    return await Notifications.scheduleNotificationAsync({
      content: notificationContent,
      trigger: {
        type: 'date' as any,
        date: scheduledTime,
      },
    });
  } else {
    return await Notifications.scheduleNotificationAsync({
      content: notificationContent,
      trigger: null, // Immediate notification
    });
  }
}

export async function cancelNotification(notificationId: string) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

export async function setBadgeCount(count: number) {
  await Notifications.setBadgeCountAsync(count);
}

export async function clearBadgeCount() {
  await Notifications.setBadgeCountAsync(0);
}

// Delivery notification helpers
export function createDeliveryNotificationData(deliveryId: string, type: string) {
  return {
    type: 'delivery',
    deliveryId,
    notificationType: type,
    timestamp: Date.now(),
  };
}

// Maintenance notification helpers
export function createMaintenanceNotificationData(requestId: string, type: string) {
  return {
    type: 'maintenance',
    requestId,
    notificationType: type,
    timestamp: Date.now(),
  };
}

export const NotificationTypes = {
  DELIVERY_INCOMING: 'delivery_incoming',
  DELIVERY_DELIVERED: 'delivery_delivered',
  DELIVERY_CONFIRMED: 'delivery_confirmed',
  DELIVERY_ISSUE: 'delivery_issue',
  MAINTENANCE_ASSIGNED: 'maintenance_assigned',
  MAINTENANCE_UPDATED: 'maintenance_updated',
  MAINTENANCE_COMPLETED: 'maintenance_completed',
  NOTICE_NEW: 'notice_new',
  VISITOR_APPROVED: 'visitor_approved',
  VISITOR_DENIED: 'visitor_denied',
} as const;

export type NotificationType = (typeof NotificationTypes)[keyof typeof NotificationTypes];
