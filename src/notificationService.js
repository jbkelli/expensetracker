import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request notification permissions
export const requestNotificationPermissions = async () => {
  if (!Device.isDevice) {
    console.log('Must use physical device for Push Notifications');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return false;
  }

  return true;
};

// Schedule daily report notification
export const scheduleDailyReportNotification = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📊 Daily Report Ready',
      body: 'Check your spending summary for today!',
      data: { type: 'daily_report' },
    },
    trigger: {
      hour: 20, // 8 PM
      minute: 0,
      repeats: true,
    },
  });
};

// Schedule weekly report notification
export const scheduleWeeklyReportNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📈 Weekly Report',
      body: 'Your weekly financial summary is ready!',
      data: { type: 'weekly_report' },
    },
    trigger: {
      weekday: 1, // Monday
      hour: 9,
      minute: 0,
      repeats: true,
    },
  });
};

// Schedule monthly report notification
export const scheduleMonthlyReportNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '💰 Monthly Report',
      body: 'Your monthly financial breakdown is available!',
      data: { type: 'monthly_report' },
    },
    trigger: {
      day: 1, // First day of month
      hour: 10,
      minute: 0,
      repeats: true,
    },
  });
};

// Schedule SMS sync reminder
export const scheduleSMSSyncReminder = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '💬 Sync Your Messages',
      body: 'Remember to sync your M-Pesa messages for automatic tracking!',
      data: { type: 'sms_sync_reminder' },
    },
    trigger: {
      seconds: 60 * 60 * 24 * 7, // Every 7 days
      repeats: true,
    },
  });
};

// Setup all notifications
export const setupNotifications = async () => {
  const hasPermission = await requestNotificationPermissions();
  
  if (hasPermission) {
    await scheduleDailyReportNotification();
    await scheduleWeeklyReportNotification();
    await scheduleMonthlyReportNotification();
    await scheduleSMSSyncReminder();
    return true;
  }
  
  return false;
};

// Send immediate notification
export const sendImmediateNotification = async (title, body, data = {}) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: null, // Send immediately
  });
};

// Cancel all notifications
export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};
