import { query, mutation } from './_generated/server';
import { PushNotifications } from '@convex-dev/expo-push-notifications';
import { v } from 'convex/values';
import { Id } from './_generated/dataModel';
import { components } from './_generated/api';

const pushNotifications = new PushNotifications<Id<'users'>>(components.pushNotifications);

// Record push notification token for a user
export const recordPushNotificationToken = mutation({
  args: { token: v.string() },
  returns: v.object({
    success: v.boolean(),
    message: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { success: false, message: 'User not authenticated' };
    }

    // Get current user
    const currentUser = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
      .unique();
    if (!currentUser) {
      return { success: false, message: 'User not found' };
    }

    try {
      await pushNotifications.recordToken(ctx, {
        userId: currentUser._id,
        pushToken: args.token,
      });

      return { success: true, message: 'Push notification token recorded successfully' };
    } catch (error) {
      console.error('Error recording push token:', error);
      return { success: false, message: 'Failed to record push notification token' };
    }
  },
});

// Send delivery notification to user
export const sendDeliveryNotification = mutation({
  args: {
    userId: v.id('users'),
    deliveryId: v.id('deliveries'),
    title: v.string(),
    body: v.string(),
    data: v.optional(
      v.object({
        type: v.string(),
        deliveryId: v.string(),
      })
    ),
  },
  returns: v.object({
    success: v.boolean(),
    notificationId: v.union(v.string(), v.null()),
    message: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    try {
      const notificationId = await pushNotifications.sendPushNotification(ctx, {
        userId: args.userId,
        notification: {
          title: args.title,
          body: args.body,
          data: args.data || {
            type: 'delivery',
            deliveryId: args.deliveryId,
          },
        },
      });

      return {
        success: true,
        notificationId: notificationId || null,
        message: 'Delivery notification sent successfully',
      };
    } catch (error) {
      console.error('Error sending delivery notification:', error);
      return {
        success: false,
        notificationId: null,
        message: 'Failed to send delivery notification',
      };
    }
  },
});

// Get notification status
export const getNotificationStatus = query({
  args: { notificationId: v.string() },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    try {
      return await pushNotifications.getNotification(ctx, { id: args.notificationId });
    } catch (error) {
      console.error('Error getting notification status:', error);
      return null;
    }
  },
});

// Get all notifications for a user
export const getNotificationsForUser = query({
  args: { userId: v.id('users') },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    try {
      return await pushNotifications.getNotificationsForUser(ctx, { userId: args.userId });
    } catch (error) {
      console.error('Error getting notifications for user:', error);
      return [];
    }
  },
});

// Get user's push notification status
export const getUserNotificationStatus = query({
  args: { userId: v.id('users') },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    try {
      return await pushNotifications.getStatusForUser(ctx, { userId: args.userId });
    } catch (error) {
      console.error('Error getting user notification status:', error);
      return null;
    }
  },
});

// Note: Pause/resume functionality would need to be implemented in the component
// For now, we'll just store user preferences in the database

// Get user notification preferences
export const getUserNotificationPreferences = query({
  args: { userId: v.id('users') },
  returns: v.object({
    deliveryNotifications: v.boolean(),
    maintenanceNotifications: v.boolean(),
    generalNotifications: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    // For now, return default preferences since notificationPreferences isn't in schema yet
    return {
      deliveryNotifications: true,
      maintenanceNotifications: true,
      generalNotifications: true,
    };
  },
});
