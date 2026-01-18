import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSize } from '../theme';
import { getUncategorizedTransactions, updateTransactionCategory, getCategories, getUserByEmail, updateUserBalance } from '../database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestSMSPermission, checkSMSPermission, readSMSMessages } from '../smsReader';
import { processSMSMessages } from '../smsService';

export default function SMSScreen({ navigation }) {
  const [uncategorizedTransactions, setUncategorizedTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [smsPermission, setSmsPermission] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncing, setSyncing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
      checkPermissions();
    }, [])
  );

  const checkPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await checkSMSPermission();
        setSmsPermission(granted);
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const loadData = async () => {
    try {
      const userId = parseInt(await AsyncStorage.getItem('userId'));
      const uncategorized = await getUncategorizedTransactions(userId);
      setUncategorizedTransactions(uncategorized);

      const allCategories = await getCategories(userId, 'expense');
      setCategories(allCategories);

      const lastSync = await AsyncStorage.getItem('lastSmsSync');
      if (lastSync) {
        setLastSyncTime(new Date(lastSync));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const syncSMS = async () => {
    if (!smsPermission) {
      Alert.alert(
        'Permission Required',
        'CashKelli needs SMS permission to automatically track transactions from M-Pesa and bank messages.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Grant Permission',
            onPress: async () => {
              const granted = await requestSMSPermission();
              setSmsPermission(granted);
              if (granted) {
                syncSMS();
              }
            },
          },
        ]
      );
      return;
    }

    setSyncing(true);

    try {
      const userId = parseInt(await AsyncStorage.getItem('userId'));
      
      // Read SMS messages
      const messages = await readSMSMessages(500); // Read last 500 messages
      
      if (messages.length === 0) {
        Alert.alert('No Messages', 'No SMS messages found to sync.');
        setSyncing(false);
        return;
      }

      // Process SMS messages
      const processed = await processSMSMessages(userId, messages);

      await AsyncStorage.setItem('lastSmsSync', new Date().toISOString());
      setLastSyncTime(new Date());

      // Update user balance based on new transactions
      if (processed.length > 0) {
        const userEmail = await AsyncStorage.getItem('userEmail');
        const user = await getUserByEmail(userEmail);
        
        let balanceChange = 0;
        processed.forEach(txn => {
          if (txn.type === 'income') {
            balanceChange += txn.amount;
          } else if (txn.type === 'expense') {
            balanceChange -= txn.amount;
          }
        });
        
        await updateUserBalance(userId, user.current_balance + balanceChange);
      }

      // Reload data
      await loadData();

      if (processed.length > 0) {
        Alert.alert(
          'Sync Complete',
          `Successfully synced ${processed.length} transaction(s) from your messages!`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Sync Complete',
          'No new financial transactions found in your messages.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error syncing SMS:', error);
      Alert.alert('Error', 'Failed to sync SMS messages: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  const categorizeTransaction = async (transactionId, categoryId) => {
    try {
      await updateTransactionCategory(transactionId, categoryId);
      Alert.alert('Success', 'Transaction categorized successfully!');
      loadData();
      setShowCategoryModal(false);
      setSelectedTransaction(null);
    } catch (error) {
      console.error('Error categorizing transaction:', error);
      Alert.alert('Error', 'Failed to categorize transaction');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.syncInfo}>
          <Text style={styles.syncLabel}>Last Sync:</Text>
          <Text style={styles.syncTime}>
            {lastSyncTime ? lastSyncTime.toLocaleString() : 'Never'}
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.syncButton, syncing && styles.syncButtonDisabled]} 
          onPress={syncSMS}
          disabled={syncing}
        >
          {syncing ? (
            <ActivityIndicator color={colors.text} size="small" />
          ) : (
            <>
              <Text style={styles.syncIcon}>🔄</Text>
              <Text style={styles.syncButtonText}>Sync SMS</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {uncategorizedTransactions.length > 0 && (
        <View style={styles.alertCard}>
          <Text style={styles.alertIcon}>⚠️</Text>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Action Required</Text>
            <Text style={styles.alertText}>
              {uncategorizedTransactions.length} transactions need categorization
            </Text>
          </View>
        </View>
      )}

      <ScrollView style={styles.list}>
        <Text style={styles.sectionTitle}>Uncategorized Transactions</Text>

        {uncategorizedTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyText}>All transactions are categorized!</Text>
            <Text style={styles.emptySubtext}>
              Enable SMS sync to automatically track expenses from your bank messages
            </Text>
          </View>
        ) : (
          uncategorizedTransactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionTitle}>{transaction.description}</Text>
                <Text style={styles.transactionAmount}>
                  KSh {transaction.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                </Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
              <TouchableOpacity
                style={styles.categorizeButton}
                onPress={() => {
                  setSelectedTransaction(transaction);
                  setShowCategoryModal(true);
                }}
              >
                <Text style={styles.categorizeButtonText}>Categorize</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {showCategoryModal && selectedTransaction && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <Text style={styles.modalSubtitle}>{selectedTransaction.description}</Text>

            <ScrollView style={styles.categoryList}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryItem}
                  onPress={() => categorizeTransaction(selectedTransaction.id, category.id)}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowCategoryModal(false);
                setSelectedTransaction(null);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  syncInfo: {
    flex: 1,
  },
  syncLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  syncTime: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: 'bold',
  },
  syncButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  syncButtonDisabled: {
    opacity: 0.6,
  },
  syncIcon: {
    fontSize: 20,
  },
  syncButtonText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: 'bold',
  },
  alertCard: {
    backgroundColor: colors.warning + '20',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.warning,
  },
  alertIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  alertText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  list: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  transactionItem: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  transactionAmount: {
    fontSize: fontSize.lg,
    color: colors.expense,
    fontWeight: 'bold',
    marginBottom: spacing.xs / 2,
  },
  transactionDate: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  categorizeButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  categorizeButtonText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  categoryList: {
    maxHeight: 400,
    marginBottom: spacing.lg,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  categoryName: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: colors.border,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: 'bold',
  },
});
