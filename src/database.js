import * as SQLite from 'expo-sqlite';

let db;

const getDb = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('expensetracker.db');
  }
  return db;
};

export const initDatabase = async () => {
  try {
    const database = await getDb();
    
    // Users table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        initial_balance REAL DEFAULT 0,
        current_balance REAL DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Categories table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
        icon TEXT,
        color TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    // Transactions table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        category_id INTEGER,
        amount REAL NOT NULL,
        type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
        description TEXT,
        sms_text TEXT,
        date TEXT NOT NULL,
        is_auto_categorized INTEGER DEFAULT 0,
        needs_categorization INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (category_id) REFERENCES categories(id)
      );
    `);

    // Budgets table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS budgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        category_id INTEGER,
        amount REAL NOT NULL,
        period TEXT CHECK(period IN ('daily', 'weekly', 'monthly', 'yearly')) DEFAULT 'monthly',
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (category_id) REFERENCES categories(id)
      );
    `);

    // SMS Messages table (to avoid duplicate processing)
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS processed_sms (
        user_id INTEGER NOT NULL,
        message_id TEXT UNIQUE NOT NULL,
        sender TEXT,
        message TEXT,
        processed_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    console.log('Database tables initialized successfully');
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    // Log the error but don't throw - allow app to continue
    // Individual screens will handle database errors
    return false;
  }
};

// User operations
export const createUser = async (name, email, password, initialBalance) => {
  const database = await getDb();
  const result = await database.runAsync(
    'INSERT INTO users (name, email, password, initial_balance, current_balance) VALUES (?, ?, ?, ?, ?)',
    [name, email, password, initialBalance, initialBalance]
  );
  return result.lastInsertRowId;
};

export const getUserByEmail = async (email) => {
  const database = await getDb();
  const user = await database.getFirstAsync(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
  return user;
};

export const getUserById = async (userId) => {
  const database = await getDb();
  const user = await database.getFirstAsync(
    'SELECT id, name AS username, email, current_balance FROM users WHERE id = ?',
    [userId]
  );
  return user;
};

export const updateUserPassword = async (userId, newPassword) => {
  const database = await getDb();
  await database.runAsync(
    'UPDATE users SET password = ? WHERE id = ?',
    [newPassword, userId]
  );
};

export const deleteUser = async (userId) => {
  const database = await getDb();
  // Delete all user data
  await database.runAsync('DELETE FROM transactions WHERE user_id = ?', [userId]);
  await database.runAsync('DELETE FROM categories WHERE user_id = ?', [userId]);
  await database.runAsync('DELETE FROM budgets WHERE user_id = ?', [userId]);
  await database.runAsync('DELETE FROM processed_sms WHERE user_id = ?', [userId]);
  await database.runAsync('DELETE FROM users WHERE id = ?', [userId]);
};

export const updateUserBalance = async (userId, newBalance) => {
  const database = await getDb();
  await database.runAsync(
    'UPDATE users SET current_balance = ? WHERE id = ?',
    [newBalance, userId]
  );
};

// Category operations
export const createCategory = async (userId, name, type, icon, color) => {
  const database = await getDb();
  const result = await database.runAsync(
    'INSERT INTO categories (user_id, name, type, icon, color) VALUES (?, ?, ?, ?, ?)',
    [userId, name, type, icon, color]
  );
  return result.lastInsertRowId;
};

export const getCategories = async (userId, type = null) => {
  const database = await getDb();
  const query = type 
    ? 'SELECT * FROM categories WHERE user_id = ? AND type = ? ORDER BY name'
    : 'SELECT * FROM categories WHERE user_id = ? ORDER BY name';
  const params = type ? [userId, type] : [userId];

  const categories = await database.getAllAsync(query, params);
  return categories;
};

export const initDefaultCategories = async (userId) => {
  const defaultCategories = [
    // Expense categories
    { name: 'Food & Dining', type: 'expense', icon: '🍔', color: '#FF5252' },
    { name: 'Transportation', type: 'expense', icon: '🚗', color: '#FF6E40' },
    { name: 'Shopping', type: 'expense', icon: '🛍️', color: '#FF4081' },
    { name: 'Entertainment', type: 'expense', icon: '🎬', color: '#E040FB' },
    { name: 'Bills & Utilities', type: 'expense', icon: '📱', color: '#7C4DFF' },
    { name: 'Health & Fitness', type: 'expense', icon: '⚕️', color: '#536DFE' },
    { name: 'Airtime & Data', type: 'expense', icon: '📞', color: '#00BCD4' },
    { name: 'Bank Charges', type: 'expense', icon: '🏦', color: '#607D8B' },
    { name: 'Transfer', type: 'expense', icon: '💸', color: '#9E9E9E' },
    { name: 'Education', type: 'expense', icon: '📚', color: '#448AFF' },
    { name: 'Other Expenses', type: 'expense', icon: '📦', color: '#FF5252' },
    
    // Income categories
    { name: 'Salary', type: 'income', icon: '💰', color: '#4CAF50' },
    { name: 'Business', type: 'income', icon: '💼', color: '#8BC34A' },
    { name: 'Investment', type: 'income', icon: '📈', color: '#66BB6A' },
    { name: 'Gift', type: 'income', icon: '🎁', color: '#81C784' },
    { name: 'Other Income', type: 'income', icon: '💵', color: '#A5D6A7' },
  ];

  const promises = defaultCategories.map(cat => 
    createCategory(userId, cat.name, cat.type, cat.icon, cat.color)
  );
  await Promise.all(promises);
};

// Transaction operations
export const createTransaction = async (userId, categoryId, amount, type, description, smsText, date, isAutoCategorized, needsCategorization) => {
  const database = await getDb();
  const result = await database.runAsync(
    'INSERT INTO transactions (user_id, category_id, amount, type, description, sms_text, date, is_auto_categorized, needs_categorization) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [userId, categoryId, amount, type, description, smsText, date, isAutoCategorized ? 1 : 0, needsCategorization ? 1 : 0]
  );
  return result.lastInsertRowId;
};

export const getTransactions = async (userId, limit = null) => {
  const database = await getDb();
  const query = limit
    ? 'SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color FROM transactions t LEFT JOIN categories c ON t.category_id = c.id WHERE t.user_id = ? ORDER BY t.date DESC, t.created_at DESC LIMIT ?'
    : 'SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color FROM transactions t LEFT JOIN categories c ON t.category_id = c.id WHERE t.user_id = ? ORDER BY t.date DESC, t.created_at DESC';
  
  const params = limit ? [userId, limit] : [userId];
  const transactions = await database.getAllAsync(query, params);
  return transactions;
};

export const getUncategorizedTransactions = async (userId) => {
  const database = await getDb();
  const transactions = await database.getAllAsync(
    'SELECT * FROM transactions WHERE user_id = ? AND needs_categorization = 1 ORDER BY created_at DESC',
    [userId]
  );
  return transactions;
};

export const updateTransactionCategory = async (transactionId, categoryId) => {
  const database = await getDb();
  await database.runAsync(
    'UPDATE transactions SET category_id = ?, needs_categorization = 0 WHERE id = ?',
    [categoryId, transactionId]
  );
};

export const deleteTransaction = async (transactionId) => {
  const database = await getDb();
  await database.runAsync('DELETE FROM transactions WHERE id = ?', [transactionId]);
};

export const getTransactionsByDateRange = async (userId, startDate, endDate) => {
  const database = await getDb();
  const transactions = await database.getAllAsync(
    'SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color FROM transactions t LEFT JOIN categories c ON t.category_id = c.id WHERE t.user_id = ? AND t.date BETWEEN ? AND ? ORDER BY t.date DESC',
    [userId, startDate, endDate]
  );
  return transactions;
};

// Budget operations
export const createBudget = async (userId, categoryId, amount, period, startDate, endDate) => {
  const database = await getDb();
  const result = await database.runAsync(
    'INSERT INTO budgets (user_id, category_id, amount, period, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, categoryId, amount, period, startDate, endDate]
  );
  return result.lastInsertRowId;
};

export const getBudgets = async (userId) => {
  const database = await getDb();
  const budgets = await database.getAllAsync(
    'SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color FROM budgets b LEFT JOIN categories c ON b.category_id = c.id WHERE b.user_id = ? ORDER BY b.created_at DESC',
    [userId]
  );
  return budgets;
};

export const deleteBudget = async (budgetId) => {
  const database = await getDb();
  await database.runAsync(
    'DELETE FROM budgets WHERE id = ?',
    [budgetId]
  );
};

export const getBudgetSpending = async (budgetId, startDate, endDate) => {
  const database = await getDb();
  const result = await database.getFirstAsync(
    'SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE category_id = (SELECT category_id FROM budgets WHERE id = ?) AND type = "expense" AND date BETWEEN ? AND ?',
    [budgetId, startDate, endDate]
  );
  return result.total;
};

// SMS operations
export const isSMSProcessed = async (userId, messageId) => {
  const database = await getDb();
  const result = await database.getFirstAsync(
    'SELECT * FROM processed_sms WHERE user_id = ? AND message_id = ?',
    [userId, messageId]
  );
  return !!result;
};

export const markSMSProcessed = async (userId, messageId, sender, message) => {
  const database = await getDb();
  await database.runAsync(
    'INSERT INTO processed_sms (user_id, message_id, sender, message) VALUES (?, ?, ?, ?)',
    [userId, messageId, sender, message]
  );
};
