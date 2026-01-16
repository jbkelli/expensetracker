# Expense Tracker Mobile App

A React Native mobile application for tracking expenses, income, and budgets with automatic SMS transaction detection.

## Features

### 🔐 Authentication
- User sign up with initial balance
- Secure login system
- User profile management

### 💰 Transaction Management
- Manual income and expense entry
- Automatic SMS detection for bank and M-Pesa messages
- Auto-categorization of transactions
- Transaction history with search and filtering
- Export transactions as PDF

### 📱 SMS Integration
- Reads bank and M-Pesa SMS messages
- Automatically extracts transaction details
- Smart categorization based on transaction description
- Manual categorization for unrecognized transactions

### 🎯 Budget Tracking
- Create budgets for different categories
- Real-time spending tracking
- Visual progress indicators
- Budget alerts and warnings
- Multiple budget periods (daily, weekly, monthly, yearly)

### 📊 Categories
- Pre-defined expense categories:
  - Food & Dining 🍔
  - Transportation 🚗
  - Shopping 🛍️
  - Entertainment 🎬
  - Bills & Utilities 💡
  - Health & Fitness 💊
  - Airtime & Data 📱
  - Bank Charges 🏦
  - Transfer 💸
  - Other 📦

- Income categories:
  - Salary 💰
  - Business 💼
  - Investment 📈
  - Gift 🎁
  - Other Income 💵

### 📈 Analytics
- Dashboard with current balance
- Monthly income and expense summary
- 6-month spending trend chart
- Category-wise spending breakdown

### 📄 Export & Reports
- Generate PDF reports
- Export by period (this month, last month, all time)
- Detailed transaction breakdown
- Budget status in reports

### 🌙 Dark Mode
- Beautiful dark theme throughout the app
- Eye-friendly color scheme
- Consistent UI/UX

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Stack & Bottom Tabs)
- **Database**: SQLite (expo-sqlite)
- **Charts**: react-native-chart-kit
- **PDF Generation**: expo-print
- **SMS Reading**: expo-sms
- **Storage**: AsyncStorage

## Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Start the development server:
   \`\`\`bash
   npm start
   \`\`\`

4. Run on your device:
   - For Android: Press \`a\` or \`npm run android\`
   - For iOS: Press \`i\` or \`npm run ios\`

## Permissions

The app requires the following permissions:
- **READ_SMS**: To read bank and M-Pesa transaction messages
- **RECEIVE_SMS**: To automatically detect new transaction messages

## Database Schema

### Users
- id, name, email, password, initial_balance, current_balance, created_at

### Categories
- id, user_id, name, type, icon, color

### Transactions
- id, user_id, category_id, amount, type, description, sms_text, date, is_auto_categorized, needs_categorization, created_at

### Budgets
- id, user_id, category_id, amount, period, start_date, end_date, created_at

### Processed SMS
- id, message_id, sender, message, processed_at

## SMS Parsing

The app automatically detects and parses:
- **M-Pesa transactions**: Received, sent, withdrawals, airtime purchases
- **Bank transactions**: Credits and debits from various banks
- **Transaction amounts**: Extracts KSh amounts from messages
- **Sender information**: Identifies transaction parties

## Future Enhancements

- Cloud backup and sync
- Multiple accounts support
- Recurring transactions
- Split transactions
- Receipt capture
- Spending insights and AI recommendations
- Multi-currency support
- Export to Excel/CSV
- Reminders and notifications
- Family/shared budgets

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
