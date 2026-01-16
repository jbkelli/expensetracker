# 🚀 START HERE - Expense Tracker App

## What You Got

A **complete React Native expense tracker mobile app** with:
- ✅ Automatic SMS transaction detection (M-Pesa & Banks)
- ✅ Budget tracking with visual progress
- ✅ PDF report exports
- ✅ Beautiful dark mode design
- ✅ 15 pre-defined categories
- ✅ Charts and analytics
- ✅ Full offline functionality

## Quick Start (3 Steps)

### 1️⃣ Install Dependencies
```bash
cd /home/kasey/Documents/coding/expensetracker
npm install
```

### 2️⃣ Start the App
```bash
npm start
```

### 3️⃣ Open on Your Phone
- Install **Expo Go** app
- Scan the QR code
- App will load!

## First Time Setup

1. **Sign Up** - Create account with initial balance
2. **Add Transaction** - Test by adding income/expense
3. **Create Budget** - Set spending limits
4. **Enable SMS** (Android) - Auto-track transactions

## File Structure

```
expensetracker/
├── 📱 App.js                  # Main app entry
├── 📦 package.json            # Dependencies
├── ⚙️ app.json                # Expo config
│
├── 📂 src/
│   ├── 🎨 theme.js            # Dark mode colors
│   ├── 💾 database.js         # SQLite operations
│   ├── 💬 smsService.js       # SMS parsing
│   ├── 📄 pdfService.js       # PDF generation
│   │
│   └── 📂 screens/
│       ├── SignInScreen.js
│       ├── SignUpScreen.js
│       ├── HomeScreen.js
│       ├── TransactionsScreen.js
│       ├── AddTransactionScreen.js
│       ├── BudgetsScreen.js
│       └── SMSScreen.js
│
└── 📚 Documentation/
    ├── README.md              # Overview
    ├── INSTALL.md             # Quick install
    ├── SETUP.md               # Detailed setup
    ├── FEATURES.md            # All features
    ├── SCREENS.md             # Screen flow
    └── CHECKLIST.md           # Completion status
```

## Features at a Glance

### 💰 Transaction Management
- Manual income/expense entry
- Automatic SMS detection
- Smart categorization
- Search & filter
- PDF export

### 🎯 Budget Tracking
- Set spending limits
- Real-time progress
- Color-coded alerts
- Category-based budgets

### 📊 Analytics
- Dashboard with balance
- Monthly summaries
- 6-month trend chart
- Category breakdown

### 📱 SMS Auto-Detection
Reads and parses:
- M-Pesa transactions
- Bank deposits/withdrawals
- Airtime purchases
- Money transfers

### 🌙 Dark Mode
Beautiful dark theme throughout!

## Need Help?

- 📖 **Quick Start**: [INSTALL.md](INSTALL.md)
- 🔧 **Detailed Setup**: [SETUP.md](SETUP.md)
- ✨ **All Features**: [FEATURES.md](FEATURES.md)
- 📱 **Screen Guide**: [SCREENS.md](SCREENS.md)

## Troubleshooting

**App won't start?**
```bash
rm -rf node_modules
npm install
npm start -- --clear
```

**Need Node.js?**
Download from: https://nodejs.org/

**SMS not working?**
- Only works on Android
- Grant SMS permissions when prompted

## What's Included

✅ 7 fully functional screens
✅ SQLite database with 5 tables
✅ 15 pre-defined categories
✅ SMS parsing for M-Pesa & banks
✅ PDF export with beautiful formatting
✅ Dark mode theme
✅ Charts and analytics
✅ Complete documentation

## Tech Stack

- React Native + Expo
- SQLite database
- React Navigation
- Chart Kit
- PDF generation
- SMS reading

## Ready to Go!

This is a **production-ready** app. Just:
1. Install dependencies
2. Start the server
3. Open on your phone
4. Start tracking expenses!

**Let's get started! 🎉**

```bash
npm install && npm start
```
