# Quick Installation Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Start the App

```bash
npm start
```

## Step 3: Run on Your Device

### Option A: Physical Device (Recommended)
1. Install "Expo Go" app from Play Store (Android) or App Store (iOS)
2. Scan the QR code shown in the terminal
3. App will load on your device

### Option B: Android Emulator
```bash
npm run android
```

### Option C: iOS Simulator (Mac only)
```bash
npm run ios
```

## First Steps

1. **Sign Up**: Create your account with initial balance
2. **Add Transaction**: Test by adding an income or expense
3. **Create Budget**: Set a budget for a category
4. **Enable SMS** (Android only): Grant SMS permission for auto-tracking

## Troubleshooting

### "npm: command not found"
Install Node.js from: https://nodejs.org/

### "expo: command not found"
```bash
npm install -g expo-cli
```

### App won't load
```bash
rm -rf node_modules
npm install
npm start -- --clear
```

## Need Help?

See SETUP.md for detailed instructions.
