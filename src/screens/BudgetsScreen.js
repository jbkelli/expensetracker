import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { colors, spacing, borderRadius, fontSize } from '../theme';
import {
  getBudgets,
  createBudget,
  deleteBudget,
  getCategories,
  getBudgetSpending,
  getTransactionsByDateRange,
} from '../database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, startOfMonth, endOfMonth, addMonths } from 'date-fns';

export default function BudgetsScreen() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [period, setPeriod] = useState('monthly');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userId = parseInt(await AsyncStorage.getItem('userId'));
      const budgetsData = await getBudgets(userId);

      // Calculate spending for each budget
      const budgetsWithSpending = await Promise.all(
        budgetsData.map(async (budget) => {
          const spent = await getBudgetSpending(
            budget.id,
            budget.start_date,
            budget.end_date
          );
          return { ...budget, spent };
        })
      );

      setBudgets(budgetsWithSpending);

      const cats = await getCategories(userId, 'expense');
      setCategories(cats);
    } catch (error) {
      console.error('Error loading budgets:', error);
    }
  };

  const handleAddBudget = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    try {
      const userId = parseInt(await AsyncStorage.getItem('userId'));
      const startDate = format(startOfMonth(new Date()), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(addMonths(new Date(), 1)), 'yyyy-MM-dd');

      await createBudget(
        userId,
        selectedCategory,
        parseFloat(amount),
        period,
        startDate,
        endDate
      );

      Alert.alert('Success', 'Budget created successfully!');
      setShowAddModal(false);
      setAmount('');
      setSelectedCategory(null);
      loadData();
    } catch (error) {
      console.error('Error creating budget:', error);
      Alert.alert('Error', 'Failed to create budget');
    }
  };

  const handleDeleteBudget = (budgetId, categoryName) => {
    Alert.alert(
      'Delete Budget',
      `Are you sure you want to delete the budget for ${categoryName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBudget(budgetId);
              Alert.alert('Success', 'Budget deleted successfully!');
              loadData();
            } catch (error) {
              console.error('Error deleting budget:', error);
              Alert.alert('Error', 'Failed to delete budget');
            }
          },
        },
      ]
    );
  };

  const getBudgetStatus = (spent, total) => {
    const percentage = (spent / total) * 100;
    if (percentage >= 90) return { color: colors.error, status: 'Over Budget' };
    if (percentage >= 70) return { color: colors.warning, status: 'Warning' };
    return { color: colors.success, status: 'On Track' };
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonText}>+ Add Budget</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list}>
        {budgets.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyText}>No budgets yet</Text>
            <Text style={styles.emptySubtext}>
              Create a budget to track your spending limits
            </Text>
          </View>
        ) : (
          budgets.map((budget) => {
            const percentage = Math.min((budget.spent / budget.amount) * 100, 100);
            const status = getBudgetStatus(budget.spent, budget.amount);

            return (
              <View key={budget.id} style={styles.budgetCard}>
                <View style={styles.budgetHeader}>
                  <View style={styles.budgetInfo}>
                    <Text style={styles.budgetIcon}>{budget.category_icon}</Text>
                    <View>
                      <Text style={styles.budgetTitle}>{budget.category_name}</Text>
                      <Text style={[styles.budgetStatus, { color: status.color }]}>
                        {status.status}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteBudget(budget.id, budget.category_name)}
                  >
                    <Text style={styles.deleteIcon}>🗑️</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.budgetAmounts}>
                  <Text style={styles.spentAmount}>
                    KSh {budget.spent.toLocaleString('en-KE', { minimumFractionDigits: 0 })}
                  </Text>
                  <Text style={styles.totalAmount}>
                    of KSh {budget.amount.toLocaleString('en-KE', { minimumFractionDigits: 0 })}
                  </Text>
                </View>

                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${percentage}%`,
                        backgroundColor: status.color,
                      },
                    ]}
                  />
                </View>

                <Text style={styles.progressText}>{percentage.toFixed(0)}% used</Text>
              </View>
            );
          })
        )}
      </ScrollView>

      {showAddModal && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Budget</Text>

            <Text style={styles.label}>Amount (KSh)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter budget amount"
              placeholderTextColor={colors.textSecondary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />

            <Text style={styles.label}>Select Category</Text>
            <ScrollView style={styles.categoryList}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    selectedCategory === category.id && styles.categoryItemSelected,
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddModal(false);
                  setAmount('');
                  setSelectedCategory(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddBudget}
              >
                <Text style={styles.submitButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
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
  },
  addButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  budgetCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  budgetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  budgetIcon: {
    fontSize: 32,
  },
  budgetTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
  },
  budgetStatus: {
    fontSize: fontSize.sm,
    fontWeight: 'bold',
    marginTop: spacing.xs / 2,
  },
  deleteIcon: {
    fontSize: 24,
  },
  budgetAmounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  spentAmount: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  totalAmount: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  progressText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'right',
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
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    color: colors.text,
    fontSize: fontSize.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryList: {
    maxHeight: 200,
    marginBottom: spacing.lg,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
  },
  categoryItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
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
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
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
  submitButton: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  submitButtonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: 'bold',
  },
});
