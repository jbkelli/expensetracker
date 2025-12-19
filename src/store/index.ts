import { create } from 'zustand';
import { supabase } from '../services/supabase';
import type { Transaction, Account, Budget, User } from '../types';

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;

  transactions: Transaction[];
  loadTransactions: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  accounts: Account[];
  loadAccounts: () => Promise<void>;
  addAccount: (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAccount: (id: string, account: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;

  budgets: Budget[];
  loadBudgets: () => Promise<void>;
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBudget: (id: string, budget: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),

  // Transactions
  transactions: [],
  loadTransactions: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (!error && data) {
      set({ transactions: data.map(t => ({ ...t, date: new Date(t.date) })) });
    }
  },
  addTransaction: async (transaction) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        ...transaction,
        user_id: user.id,
      })
      .select()
      .single();

    if (!error && data) {
      set((state) => ({ transactions: [{ ...data, date: new Date(data.date) }, ...state.transactions] }));
      
      // Update account balance
      const account = get().accounts.find(a => a.id === transaction.accountId);
      if (account) {
        const balanceChange = transaction.type === 'income' ? transaction.amount : -transaction.amount;
        await get().updateAccount(transaction.accountId, { 
          balance: account.balance + balanceChange 
        });
      }
    }
  },
  updateTransaction: async (id, updatedTransaction) => {
    const { error } = await supabase
      .from('transactions')
      .update(updatedTransaction)
      .eq('id', id);

    if (!error) {
      set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === id ? { ...t, ...updatedTransaction } : t
        ),
      }));
    }
  },
  deleteTransaction: async (id) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (!error) {
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
      }));
    }
  },

  // Accounts
  accounts: [],
  loadAccounts: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id);

    if (!error && data) {
      set({ accounts: data });
    }
  },
  addAccount: async (account) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('accounts')
      .insert({
        ...account,
        user_id: user.id,
      })
      .select()
      .single();

    if (!error && data) {
      set((state) => ({ accounts: [...state.accounts, data] }));
    }
  },
  updateAccount: async (id, updatedAccount) => {
    const { error } = await supabase
      .from('accounts')
      .update(updatedAccount)
      .eq('id', id);

    if (!error) {
      set((state) => ({
        accounts: state.accounts.map((a) =>
          a.id === id ? { ...a, ...updatedAccount } : a
        ),
      }));
    }
  },
  deleteAccount: async (id) => {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id);

    if (!error) {
      set((state) => ({
        accounts: state.accounts.filter((a) => a.id !== id),
      }));
    }
  },

  // Budgets
  budgets: [],
  loadBudgets: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id);

    if (!error && data) {
      set({ budgets: data.map(b => ({ 
        ...b, 
        startDate: new Date(b.start_date),
        endDate: new Date(b.end_date),
      })) });
    }
  },
  addBudget: async (budget) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('budgets')
      .insert({
        user_id: user.id,
        category_id: budget.categoryId,
        amount: budget.amount,
        period: budget.period,
        start_date: budget.startDate,
        end_date: budget.endDate,
        spent: budget.spent || 0,
      })
      .select()
      .single();

    if (!error && data) {
      set((state) => ({ budgets: [...state.budgets, {
        ...data,
        startDate: new Date(data.start_date),
        endDate: new Date(data.end_date),
      }] }));
    }
  },
  updateBudget: async (id, updatedBudget) => {
    const { error } = await supabase
      .from('budgets')
      .update(updatedBudget)
      .eq('id', id);

    if (!error) {
      set((state) => ({
        budgets: state.budgets.map((b) =>
          b.id === id ? { ...b, ...updatedBudget } : b
        ),
      }));
    }
  },
  deleteBudget: async (id) => {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id);

    if (!error) {
      set((state) => ({
        budgets: state.budgets.filter((b) => b.id !== id),
      }));
    }
  },
}));
