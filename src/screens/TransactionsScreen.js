import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSize } from '../theme';
import { getCategories, getTransactions, getTransactionsByDateRange, deleteTransaction } from '../database';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { generatePDFReport } from '../pdfService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [user, setUser] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const userId = parseInt(await AsyncStorage.getItem('userId'));
      const userEmail = await AsyncStorage.getItem('userEmail');
      const userName = await AsyncStorage.getItem('userName');
      
      const { getUserByEmail } = require('../database');
      const userData = await getUserByEmail(userEmail);
      setUser(userData);

      const allTransactions = await getTransactions(userId);
      setTransactions(allTransactions);
      setFilteredTransactions(allTransactions);

      const allCategories = await getCategories(userId);
      setCategories(allCategories);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const applyFilters = (filter) => {
    let filtered = [...transactions];

    if (filter !== 'all') {
      filtered = filtered.filter(t => t.type === filter);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        t =>
          t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
    setSelectedFilter(filter);
  };

  const exportReport = async (period) => {
    try {
      const userId = parseInt(await AsyncStorage.getItem('userId'));
      let startDate, endDate;

      switch (period) {
        case 'month':
          startDate = format(startOfMonth(new Date()), 'yyyy-MM-dd');
          endDate = format(endOfMonth(new Date()), 'yyyy-MM-dd');
          break;
        case 'last-month':
          const lastMonth = subMonths(new Date(), 1);
          startDate = format(startOfMonth(lastMonth), 'yyyy-MM-dd');
          endDate = format(endOfMonth(lastMonth), 'yyyy-MM-dd');
          break;
        case 'all':
        default:
          const allTrans = await getTransactions(userId);
          if (allTrans.length === 0) {
            Alert.alert('No Data', 'No transactions to export');
            return;
          }
          await generatePDFReport(user, allTrans, allTrans[allTrans.length - 1].date, allTrans[0].date);
          Alert.alert('Success', 'Report exported successfully!');
          return;
      }

      const periodTransactions = await getTransactionsByDateRange(userId, startDate, endDate);
      
      if (periodTransactions.length === 0) {
        Alert.alert('No Data', `No transactions found for the selected period`);
        return;
      }

      await generatePDFReport(user, periodTransactions, startDate, endDate);
      Alert.alert('Success', 'Report exported successfully!');
    } catch (error) {
      console.error('Error exporting report:', error);
      Alert.alert('Error', 'Failed to export report');
    }
  };

  const handleDeleteTransaction = (transactionId) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTransaction(transactionId);
              await loadData();
              Alert.alert('Success', 'Transaction deleted');
            } catch (error) {
              console.error('Error deleting transaction:', error);
              Alert.alert('Error', 'Failed to delete transaction');
            }
          },
        },
      ]
    );
  };

  const showExportOptions = () => {
    Alert.alert(
      'Export Report',
      'Select period to export',
      [
        { text: 'This Month', onPress: () => exportReport('month') },
        { text: 'Last Month', onPress: () => exportReport('last-month') },
        { text: 'All Time', onPress: () => exportReport('all') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            applyFilters(selectedFilter);
          }}
        />
        <TouchableOpacity style={styles.exportButton} onPress={showExportOptions}>
          <Text style={styles.exportIcon}>📄</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, selectedFilter === 'all' && styles.filterChipActive]}
          onPress={() => applyFilters('all')}
        >
          <Text style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, selectedFilter === 'income' && styles.filterChipActive]}
          onPress={() => applyFilters('income')}
        >
          <Text style={[styles.filterText, selectedFilter === 'income' && styles.filterTextActive]}>
            Income
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, selectedFilter === 'expense' && styles.filterChipActive]}
          onPress={() => applyFilters('expense')}
        >
          <Text style={[styles.filterText, selectedFilter === 'expense' && styles.filterTextActive]}>
            Expenses
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list}>
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No transactions found</Text>
          </View>
        ) : (
          filteredTransactions.map((transaction) => (
            <TouchableOpacity
              key={transaction.id}
              style={styles.transactionItem}
              onLongPress={() => handleDeleteTransaction(transaction.id)}
            >
              <View style={styles.transactionIcon}>
                <Text style={styles.categoryIcon}>{transaction.category_icon || '📦'}</Text>
              </View>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionTitle}>
                  {transaction.category_name || 'Uncategorized'}
                </Text>
                <Text style={styles.transactionDescription}>{transaction.description}</Text>
                <Text style={styles.transactionDate}>
                  {format(new Date(transaction.date), 'MMM dd, yyyy')}
                </Text>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  transaction.type === 'income' ? styles.incomeText : styles.expenseText,
                ]}
              >
                {transaction.type === 'income' ? '+' : '-'}
                {transaction.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text,
    fontSize: fontSize.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exportButton: {
    backgroundColor: colors.primary,
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exportIcon: {
    fontSize: 24,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: 'bold',
  },
  filterTextActive: {
    color: colors.text,
  },
  list: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  categoryIcon: {
    fontSize: 24,
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
  transactionDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs / 2,
  },
  transactionDate: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  transactionAmount: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
  },
  incomeText: {
    color: colors.income,
  },
  expenseText: {
    color: colors.expense,
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
    color: colors.textSecondary,
  },
});
