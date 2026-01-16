import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { colors, spacing, borderRadius, fontSize } from '../theme';
import { createTransaction, getCategories, getUserByEmail, updateUserBalance } from '../database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';

export default function AddTransactionScreen({ route, navigation }) {
  const { type: initialType } = route.params || {};
  const [type, setType] = useState(initialType || 'expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, [type]);

  const loadCategories = async () => {
    try {
      const userId = parseInt(await AsyncStorage.getItem('userId'));
      const cats = await getCategories(userId, type);
      setCategories(cats);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    setLoading(true);

    try {
      const userId = parseInt(await AsyncStorage.getItem('userId'));
      const userEmail = await AsyncStorage.getItem('userEmail');
      const user = await getUserByEmail(userEmail);

      await createTransaction(
        userId,
        selectedCategory,
        parseFloat(amount),
        type,
        description,
        null,
        format(new Date(), 'yyyy-MM-dd'),
        false,
        false
      );

      // Update balance
      const newBalance = type === 'income' 
        ? user.current_balance + parseFloat(amount)
        : user.current_balance - parseFloat(amount);
      
      await updateUserBalance(userId, newBalance);

      Alert.alert('Success', 'Transaction added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error adding transaction:', error);
      Alert.alert('Error', 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[styles.typeButton, type === 'income' && styles.typeButtonIncome]}
          onPress={() => {
            setType('income');
            setSelectedCategory(null);
          }}
        >
          <Text style={styles.typeIcon}>💵</Text>
          <Text style={[styles.typeText, type === 'income' && styles.typeTextActive]}>
            Income
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeButton, type === 'expense' && styles.typeButtonExpense]}
          onPress={() => {
            setType('expense');
            setSelectedCategory(null);
          }}
        >
          <Text style={styles.typeIcon}>💸</Text>
          <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>
            Expense
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Amount (KSh)</Text>
        <TextInput
          style={styles.amountInput}
          placeholder="0.00"
          placeholderTextColor={colors.textSecondary}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter description..."
          placeholderTextColor={colors.textSecondary}
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.categoriesGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                selectedCategory === category.id && styles.categoryCardSelected,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Adding...' : 'Add Transaction'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  typeSelector: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  typeButton: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  typeButtonIncome: {
    backgroundColor: colors.income,
    borderColor: colors.income,
  },
  typeButtonExpense: {
    backgroundColor: colors.expense,
    borderColor: colors.expense,
  },
  typeIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  typeText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  typeTextActive: {
    color: colors.text,
  },
  form: {
    padding: spacing.lg,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  amountInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    color: colors.text,
    fontSize: fontSize.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  categoryCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  categoryCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  categoryName: {
    fontSize: fontSize.xs,
    color: colors.text,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: 'bold',
  },
});
