import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserById, updateUserPassword, deleteUser } from '../database';
import { useTheme } from '../theme';
import { setupNotifications, cancelAllNotifications } from '../notificationService';

export default function ProfileScreen({ navigation }) {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('English');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    loadUser();
    loadNotificationSettings();
  }, []);

  const loadUser = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const userData = getUserById(parseInt(userId));
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotificationSettings = async () => {
    try {
      const enabled = await AsyncStorage.getItem('notificationsEnabled');
      setNotificationsEnabled(enabled === 'true');
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const toggleNotifications = async (value) => {
    try {
      setNotificationsEnabled(value);
      await AsyncStorage.setItem('notificationsEnabled', value.toString());
      
      if (value) {
        const success = await setupNotifications();
        if (success) {
          Alert.alert('Success', 'Notifications enabled! You will receive daily, weekly, and monthly reports.');
        } else {
          Alert.alert('Permission Denied', 'Please enable notifications in your device settings.');
          setNotificationsEnabled(false);
        }
      } else {
        await cancelAllNotifications();
        Alert.alert('Success', 'Notifications disabled');
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('userId');
            navigation.reset({
              index: 0,
              routes: [{ name: 'SignIn' }],
            });
          },
        },
      ]
    );
  };

  const handleChangePassword = () => {
    Alert.prompt(
      'Change Password',
      'Enter your new password',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Change',
          onPress: async (newPassword) => {
            if (!newPassword || newPassword.length < 4) {
              Alert.alert('Error', 'Password must be at least 4 characters');
              return;
            }
            try {
              const userId = await AsyncStorage.getItem('userId');
              updateUserPassword(parseInt(userId), newPassword);
              Alert.alert('Success', 'Password changed successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to change password');
            }
          },
        },
      ],
      'secure-text'
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure? This will delete all your data permanently. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.prompt(
              'Confirm Deletion',
              'Type "DELETE" to confirm',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Confirm',
                  style: 'destructive',
                  onPress: async (text) => {
                    if (text === 'DELETE') {
                      try {
                        const userId = await AsyncStorage.getItem('userId');
                        deleteUser(parseInt(userId));
                        await AsyncStorage.removeItem('userId');
                        navigation.reset({
                          index: 0,
                          routes: [{ name: 'SignIn' }],
                        });
                      } catch (error) {
                        Alert.alert('Error', 'Failed to delete account');
                      }
                    } else {
                      Alert.alert('Error', 'Confirmation text did not match');
                    }
                  },
                },
              ],
              'plain-text'
            );
          },
        },
      ]
    );
  };

  const handleChangeLanguage = () => {
    Alert.alert(
      'Change Language',
      'Select your preferred language',
      [
        { text: 'English', onPress: () => setLanguage('English') },
        { text: 'Swahili', onPress: () => setLanguage('Swahili') },
        { text: 'French', onPress: () => setLanguage('French') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={[styles.username, { color: theme.text }]}>{user?.username}</Text>
        <Text style={[styles.email, { color: theme.textSecondary }]}>
          {user?.email || 'No email'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          APPEARANCE
        </Text>
        
        <TouchableOpacity
          style={[styles.option, { backgroundColor: theme.card }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.optionText, { color: theme.text }]}>Dark Mode</Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: theme.primary }}
            thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.option, { backgroundColor: theme.card }]}
          onPress={handleChangeLanguage}
        >
          <Text style={[styles.optionText, { color: theme.text }]}>Language</Text>
          <Text style={[styles.optionValue, { color: theme.textSecondary }]}>
            {language}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          NOTIFICATIONS
        </Text>
        
        <TouchableOpacity
          style={[styles.option, { backgroundColor: theme.card }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.optionText, { color: theme.text }]}>Enable Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: '#767577', true: theme.primary }}
            thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
          />
        </TouchableOpacity>

        {notificationsEnabled && (
          <View style={[styles.infoBox, { backgroundColor: theme.surface }]}>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              📊 Daily reports at 8:00 PM{'\n'}
              📈 Weekly reports on Mondays{'\n'}
              💰 Monthly reports on 1st day{'\n'}
              💬 SMS sync reminders weekly
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          ACCOUNT
        </Text>
        
        <TouchableOpacity
          style={[styles.option, { backgroundColor: theme.card }]}
          onPress={handleChangePassword}
        >
          <Text style={[styles.optionText, { color: theme.text }]}>
            Change Password
          </Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.option, { backgroundColor: theme.card }]}
          onPress={handleLogout}
        >
          <Text style={[styles.optionText, { color: theme.text }]}>Logout</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.option, { backgroundColor: theme.card }]}
          onPress={handleDeleteAccount}
        >
          <Text style={[styles.optionText, { color: theme.error }]}>
            Delete Account
          </Text>
          <Text style={[styles.arrow, { color: theme.error }]}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.version, { color: theme.textSecondary }]}>
          CashKelli v1.0.0
        </Text>
        <Text style={[styles.tagline, { color: theme.textSecondary }]}>
          Your digital cash planner
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionValue: {
    fontSize: 14,
  },
  arrow: {
    fontSize: 24,
    color: '#999',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  version: {
    fontSize: 12,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  infoBox: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
