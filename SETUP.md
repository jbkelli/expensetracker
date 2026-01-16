# Expense Tracker Setup Guide

## Prerequisites

1. **Node.js** (v14 or higher)
   - Download from: https://nodejs.org/

2. **npm** or **yarn**
   - Comes with Node.js

3. **Expo CLI**
   ```bash
   npm install -g expo-cli
   ```

4. **Expo Go App** (for testing on real device)
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent
   - iOS: https://apps.apple.com/app/expo-go/id982107779

## Installation Steps

### 1. Install Dependencies

Navigate to the project directory and run:

```bash
cd /home/kasey/Documents/coding/expensetracker
npm install
```

### 2. Create Asset Files

Create placeholder assets in the `assets` folder:

```bash
mkdir -p assets
```

For quick testing, the app can run without custom assets. Expo will use defaults.
See `assets/README.md` for details on creating proper assets.

### 3. Start Development Server

```bash
npm start
```

This will open Expo DevTools in your browser.

### 4. Run on Device/Emulator

**Option A: Run on Physical Device**
1. Install Expo Go app on your phone
2. Scan the QR code from the terminal/DevTools
3. App will load on your device

**Option B: Run on Android Emulator**
```bash
npm run android
```

**Option C: Run on iOS Simulator** (Mac only)
```bash
npm run ios
```

## First Time Setup

### 1. Create an Account

1. Launch the app
2. Tap "Sign Up"
3. Enter your details:
   - Full Name
   - Email
   - Password (min 6 characters)
   - Initial Balance (optional)
4. Tap "Sign Up"

### 2. Grant SMS Permissions (Android)

For automatic transaction tracking:
1. Go to SMS tab
2. Tap "Sync SMS"
3. Allow SMS permissions when prompted

**Note**: SMS reading is only available on Android devices.

### 3. Add Your First Transaction

1. Go to Home tab
2. Tap "Add Income" or "Add Expense"
3. Enter amount
4. Enter description
5. Select category
6. Tap "Add Transaction"

### 4. Create a Budget

1. Go to Budgets tab
2. Tap "+ Add Budget"
3. Enter budget amount
4. Select category
5. Tap "Create"

## Features Overview

### Home Dashboard
- View current balance
- See monthly income/expenses
- View spending trend chart
- Quick access to recent transactions

### Transactions
- View all transactions
- Filter by type (income/expense)
- Search transactions
- Export as PDF

### Budgets
- Create category budgets
- Track spending progress
- Visual budget indicators
- Delete budgets

### SMS Sync
- Automatic SMS reading (Android only)
- Categorize uncategorized transactions
- View sync status

## SMS Message Format

The app automatically detects:

### M-Pesa Messages
- `[CODE] Confirmed. You have received Ksh1,000.00 from JOHN DOE on...`
- `[CODE] Confirmed. Ksh500.00 sent to JANE DOE on...`
- `[CODE] Confirmed. You bought Ksh100.00 of airtime...`
- `[CODE] Confirmed. Ksh2,000.00 withdrawn from...`

### Bank Messages
- Messages containing: "credited", "debited", "withdrawn", "deposited"
- With amounts in formats: Ksh1000, KES 1,000, KSH1,000.00

## Troubleshooting

### App Won't Start

1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```

2. Delete node_modules and reinstall:
   ```bash
   rm -rf node_modules
   npm install
   ```

3. Clear Expo cache:
   ```bash
   expo start -c
   ```

### SMS Not Detecting

1. Ensure SMS permissions are granted
2. Check that messages match supported formats
3. Try manually syncing from SMS tab

### Database Issues

The app uses SQLite stored locally. To reset:
1. Uninstall and reinstall the app
2. This will create a fresh database

### Transactions Not Showing

1. Pull down to refresh the screen
2. Check if you're logged in
3. Try logging out and back in

## Building for Production

### Android APK

1. Configure app.json with your details
2. Run build:
   ```bash
   expo build:android
   ```

3. Follow prompts
4. Download APK when ready

### iOS App

1. Requires Apple Developer account
2. Configure app.json
3. Run build:
   ```bash
   expo build:ios
   ```

## Environment Variables

No environment variables needed for basic setup.
All data is stored locally in SQLite.

## Support

For issues:
1. Check this guide
2. Review error messages
3. Check Expo documentation: https://docs.expo.dev/
4. Open GitHub issue

## Tips

1. **Regular Backups**: Export PDF reports regularly
2. **Categorize Promptly**: Review uncategorized transactions weekly
3. **Set Realistic Budgets**: Start with actual spending, then reduce
4. **Review Monthly**: Check spending trends each month
5. **Update Balance**: If manual transactions are missed, adjust initial balance

## Next Steps

1. Customize categories as needed
2. Set up budgets for main spending areas
3. Enable SMS sync for automatic tracking
4. Export first monthly report
5. Review spending patterns

Enjoy tracking your expenses! 💰
