# Expense Tracker - Kenyan Shilling Edition

A modern expense tracking web application built with React, TypeScript, and Material-UI. Track your income, expenses, budgets, and visualize your financial data with beautiful charts.

## 🌟 Features

### 💰 Transaction Management
- **Add Income & Expenses**: Record all your financial transactions with detailed categorization
- **Real-time Balance Updates**: Account balances update automatically when you add transactions
- **Transaction History**: View, search, and filter all your transactions
- **Multiple Accounts**: Track different accounts separately (e.g., KCB Bank, M-Pesa)

### 📊 Budget Tracking
- **Set Budget Limits**: Define monthly budgets for different expense categories
- **Automatic Tracking**: System calculates how much you've spent vs. your budget
- **Visual Progress**: See budget usage with progress bars
- **Alerts**: Know when you're approaching or exceeding budget limits

### 📈 Reports & Analytics
- **Expense Breakdown**: Pie charts showing expenses by category
- **Monthly Summary**: Track total income, expenses, and net income
- **Visual Insights**: Understand your spending patterns at a glance

### 🎨 User Interface
- **Modern Design**: Clean, professional Material-UI interface
- **Responsive**: Works on desktop, tablet, and mobile devices
- **Dark Mode Ready**: Easy on the eyes
- **Intuitive Navigation**: Simple sidebar for quick access to all features

## 🚀 How It Works

1. **Dashboard**: View your financial overview at a glance
   - Total balance across all accounts
   - Recent transactions
   - Quick statistics

2. **Add Transactions**: Click the + button to:
   - Select transaction type (Income/Expense)
   - Choose category (Food, Transport, Salary, etc.)
   - Enter amount in Kenyan Shillings
   - Select which account to use
   - Add description and date

3. **Track Budgets**: Set monthly spending limits
   - System automatically calculates spending from transactions
   - See remaining budget in real-time
   - Visual progress indicators

4. **View Reports**: Analyze your finances
   - See where your money is going
   - Compare income vs expenses
   - Monthly financial summaries

## 💻 Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite (Rolldown)
- **UI Framework**: Material-UI (MUI)
- **State Management**: Zustand
- **Routing**: React Router v6
- **Charts**: Recharts
- **Backend Ready**: Supabase configuration included

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   cd Documents/Coding/expensetracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

## 📦 Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` folder.

## 🌐 Free Deployment Options

### Option 1: Vercel (Recommended)
1. Create account at [vercel.com](https://vercel.com)
2. Install Vercel CLI: `npm i -g vercel`
3. Run `vercel` in project folder
4. Follow prompts - your app will be live in minutes!

### Option 2: Netlify
1. Create account at [netlify.com](https://netlify.com)
2. Drag and drop your `dist` folder to Netlify
3. Or connect your GitHub repo for automatic deployments

### Option 3: GitHub Pages
1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add to package.json:
   ```json
   "homepage": "https://yourusername.github.io/expensetracker",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```
3. Run `npm run deploy`

## 📝 Currency Format

All amounts are displayed in **Kenyan Shillings (KSh)** with proper formatting:
- Format: KSh 1,234.56
- Locale: en-KE
- Always shows 2 decimal places

## 🎯 Sample Data

The app comes with sample data for demonstration:
- 2 sample accounts (KCB Bank Account, M-Pesa Wallet)
- 5 sample transactions (groceries, fuel, salary, etc.)
- 3 sample budgets (Food, Transport, Entertainment)

## 🔐 Future Enhancements

- **Supabase Integration**: Connect to real database for data persistence
- **User Authentication**: Secure login system
- **Multi-user Support**: Share budgets with family
- **Export Data**: Download reports as PDF/Excel
- **Recurring Transactions**: Auto-add monthly bills
- **Mobile App**: Native iOS/Android versions

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes!

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

---

Built with ❤️ using React, TypeScript, and Material-UI
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
