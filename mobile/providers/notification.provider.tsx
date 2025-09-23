import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useUser } from '@clerk/clerk-expo';
import { useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import {
  registerForPushNotificationsAsync,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  NotificationTypes,
  type NotificationType,
} from '@/lib/notifications';
import { Alert } from 'react-native';
import { router } from 'expo-router';

interface NotificationContextType {
  expoPushToken: string | null;
  isTokenRegistered: boolean;
  lastNotification: Notifications.Notification | null;
  handleNotificationResponse: (response: Notifications.NotificationResponse) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user, isSignedIn } = useUser();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [isTokenRegistered, setIsTokenRegistered] = useState(false);
  const [lastNotification, setLastNotification] = useState<Notifications.Notification | null>(null);

  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

  // Convex mutation to register push token
  const recordPushToken = useMutation(api.pushNotifications.recordPushNotificationToken);

  // Register for push notifications and record token
  useEffect(() => {
    async function setupNotifications() {
      if (!isSignedIn || !user) return;

      try {
        const tokenData = await registerForPushNotificationsAsync();
        if (tokenData) {
          setExpoPushToken(tokenData.token);

          // Record token with Convex
          const result = await recordPushToken({ token: tokenData.token });
          if (result?.success) {
            setIsTokenRegistered(true);
            console.log('Push notification token registered successfully');
          } else {
            console.error('Failed to register push token:', result.message);
          }
        }
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    }

    setupNotifications();
  }, [isSignedIn, user, recordPushToken]);

  // Set up notification listeners
  useEffect(() => {
    // Listen for notifications received while app is in foreground
    notificationListener.current = addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      setLastNotification(notification);

      // Handle foreground notification display
      const { title, body } = notification.request.content;
      Alert.alert(title || 'Notification', body || 'You have a new notification');
    });

    // Listen for notification responses (when user taps notification)
    responseListener.current = addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      handleNotificationResponse(response);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data;
    console.log('Handling notification response with data:', data);

    if (!data || typeof data !== 'object') return;

    // Navigate based on notification type
    switch (data.type) {
      case 'delivery':
        handleDeliveryNotification(data);
        break;
      case 'maintenance':
        handleMaintenanceNotification(data);
        break;
      case 'visitor':
        handleVisitorNotification(data);
        break;
      case 'notice':
        handleNoticeNotification(data);
        break;
      default:
        console.log('Unknown notification type:', data.type);
    }
  };

  const handleDeliveryNotification = (data: any) => {
    const { deliveryId, notificationType } = data;

    switch (notificationType) {
      case NotificationTypes.DELIVERY_INCOMING:
      case NotificationTypes.DELIVERY_DELIVERED:
      case NotificationTypes.DELIVERY_CONFIRMED:
      case NotificationTypes.DELIVERY_ISSUE:
        // Navigate to delivery details or delivery list
        router.push('/'); // Navigate to home or create delivery details screen
        break;
      default:
        router.push('/');
    }
  };

  const handleMaintenanceNotification = (data: any) => {
    const { requestId, notificationType } = data;

    switch (notificationType) {
      case NotificationTypes.MAINTENANCE_ASSIGNED:
      case NotificationTypes.MAINTENANCE_UPDATED:
      case NotificationTypes.MAINTENANCE_COMPLETED:
        // Navigate to maintenance request details
        router.push(`/maintenance/${requestId}`);
        break;
      default:
        router.push('/');
    }
  };

  const handleVisitorNotification = (data: any) => {
    const { visitorRequestId, notificationType } = data;

    switch (notificationType) {
      case NotificationTypes.VISITOR_APPROVED:
      case NotificationTypes.VISITOR_DENIED:
        // Navigate to visitor details
        router.push(`/visitor/${visitorRequestId}`);
        break;
      default:
        router.push('/');
    }
  };

  const handleNoticeNotification = (data: any) => {
    const { noticeId, notificationType } = data;

    switch (notificationType) {
      case NotificationTypes.NOTICE_NEW:
        // Navigate to home where notices are displayed
        router.push('/');
        break;
      default:
        router.push('/');
    }
  };

  const contextValue: NotificationContextType = {
    expoPushToken,
    isTokenRegistered,
    lastNotification,
    handleNotificationResponse,
  };

  return <NotificationContext.Provider value={contextValue}>{children}</NotificationContext.Provider>;
}
