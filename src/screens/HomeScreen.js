import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { colors, spacing, borderRadius, fontSize } from '../theme';
import { getUserByEmail, getTransactions, updateUserBalance } from '../database';
import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const userEmail = await AsyncStorage.getItem('userEmail');

      if (!userId || !userEmail) {
        navigation.replace('SignIn');
        return;
      }

      const userData = await getUserByEmail(userEmail);
      setUser(userData);

      const allTransactions = await getTransactions(parseInt(userId));
      setTransactions(allTransactions);
      setRecentTransactions(allTransactions.slice(0, 5));

      // Calculate stats for current month
      const now = new Date();
      const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');

      const monthTransactions = allTransactions.filter(
        t => t.date >= monthStart && t.date <= monthEnd
      );

      const totalIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpense = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      setStats({
        totalIncome,
        totalExpense,
        balance: userData.current_balance,
      });

      // Update balance
      const calculatedBalance = userData.initial_balance + 
        allTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) -
        allTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

      if (Math.abs(calculatedBalance - userData.current_balance) > 0.01) {
        await updateUserBalance(parseInt(userId), calculatedBalance);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, [navigation]);

  useEffect(() => {
    loadData();
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation, loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getChartData = () => {
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = format(startOfMonth(date), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(date), 'yyyy-MM-dd');

      const monthTransactions = transactions.filter(
        t => t.date >= monthStart && t.date <= monthEnd && t.type === 'expense'
      );

      const total = monthTransactions.reduce((sum, t) => sum + t.amount, 0);

      last6Months.push({
        label: format(date, 'MMM'),
        value: total,
      });
    }

    return last6Months;
  };

  const chartData = getChartData();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.name || 'User'}! 👋</Text>
        <Text style={styles.date}>{format(new Date(), 'EEEE, MMM dd, yyyy')}</Text>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceAmount}>
          KSh {stats.balance.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Income</Text>
            <Text style={[styles.statValue, styles.incomeText]}>
              +{stats.totalIncome.toLocaleString('en-KE', { minimumFractionDigits: 0 })}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Expenses</Text>
            <Text style={[styles.statValue, styles.expenseText]}>
              -{stats.totalExpense.toLocaleString('en-KE', { minimumFractionDigits: 0 })}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.success }]}
          onPress={() => navigation.navigate('AddTransaction', { type: 'income' })}
        >
          <Text style={styles.actionIcon}>💵</Text>
          <Text style={styles.actionText}>Add Income</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.error }]}
          onPress={() => navigation.navigate('AddTransaction', { type: 'expense' })}
        >
          <Text style={styles.actionIcon}>💸</Text>
          <Text style={styles.actionText}>Add Expense</Text>
        </TouchableOpacity>
      </View>

      {chartData.length > 0 && chartData.some(d => d.value > 0) && (
        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Spending Trend (6 Months)</Text>
          <LineChart
            data={{
              labels: chartData.map(d => d.label),
              datasets: [{ data: chartData.map(d => d.value) }],
            }}
            width={Dimensions.get('window').width - 48}
            height={200}
            chartConfig={{
              backgroundColor: colors.surface,
              backgroundGradientFrom: colors.surface,
              backgroundGradientTo: colors.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: { borderRadius: borderRadius.md },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: colors.primary,
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>
      )}

      <View style={styles.transactionsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {recentTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>No transactions yet</Text>
            <Text style={styles.emptySubtext}>
              Add your first transaction or enable SMS reading to auto-track expenses
            </Text>
          </View>
        ) : (
          recentTransactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
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
                {transaction.amount.toLocaleString('en-KE', { minimumFractionDigits: 0 })}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  greeting: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  date: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  balanceCard: {
    backgroundColor: colors.primary,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  balanceLabel: {
    fontSize: fontSize.sm,
    color: colors.text,
    opacity: 0.8,
    marginBottom: spacing.xs,
  },
  balanceAmount: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.text,
    opacity: 0.3,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.text,
    opacity: 0.8,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
  },
  incomeText: {
    color: colors.income,
  },
  expenseText: {
    color: colors.expense,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  actionText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: 'bold',
  },
  chartCard: {
    backgroundColor: colors.surface,
    margin: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  chart: {
    marginVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  transactionsSection: {
    padding: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
  },
  seeAll: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: 'bold',
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
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
});
