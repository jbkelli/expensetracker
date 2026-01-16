# Expense Tracker - Screen Flow

## App Navigation Structure

```
┌─────────────────────────────────────┐
│       Authentication Stack          │
├─────────────────────────────────────┤
│  ┌────────────┐    ┌────────────┐  │
│  │  Sign In   │ ←→ │  Sign Up   │  │
│  └────────────┘    └────────────┘  │
│         │                 │         │
│         └────────┬────────┘         │
│                  ↓                  │
└──────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────┐
│         Main App (Tabs)             │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────────────────────┐  │
│  │    🏠 Home (Dashboard)       │  │
│  ├──────────────────────────────┤  │
│  │  - Current Balance           │  │
│  │  - Income/Expense Summary    │  │
│  │  - Spending Chart            │  │
│  │  - Recent Transactions       │  │
│  │  - Quick Actions             │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │    📊 Transactions           │  │
│  ├──────────────────────────────┤  │
│  │  - All Transactions List     │  │
│  │  - Search & Filter           │  │
│  │  - PDF Export Button         │  │
│  │  - Transaction Details       │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │    🎯 Budgets                │  │
│  ├──────────────────────────────┤  │
│  │  - Budget Cards              │  │
│  │  - Progress Bars             │  │
│  │  - Add Budget Button         │  │
│  │  - Spending Status           │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │    💬 SMS Sync               │  │
│  ├──────────────────────────────┤  │
│  │  - Sync Status               │  │
│  │  - Sync Button               │  │
│  │  - Uncategorized List        │  │
│  │  - Manual Categorization     │  │
│  └──────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────┐
│         Modal Screens               │
├─────────────────────────────────────┤
│  ┌────────────────────────────┐    │
│  │  💸 Add Transaction        │    │
│  ├────────────────────────────┤    │
│  │  - Type Selector           │    │
│  │  - Amount Input            │    │
│  │  - Description             │    │
│  │  - Category Grid           │    │
│  └────────────────────────────┘    │
└─────────────────────────────────────┘
```

## Screen Details

### 1. Sign In Screen
**Route**: `SignIn`
- Email input
- Password input
- Sign in button
- Link to sign up

### 2. Sign Up Screen
**Route**: `SignUp`
- Name input
- Email input
- Password input
- Confirm password input
- Initial balance input (optional)
- Sign up button
- Link to sign in

### 3. Home Screen (Dashboard)
**Route**: `Main/Home`
- Greeting with user name
- Current date
- Balance card (purple gradient)
  - Current balance
  - Monthly income
  - Monthly expenses
- Quick action buttons
  - Add Income (green)
  - Add Expense (red)
- Spending trend chart (6 months)
- Recent transactions (last 5)
- Pull to refresh

### 4. Transactions Screen
**Route**: `Main/Transactions`
- Search bar
- PDF export button (📄)
- Filter chips (All, Income, Expense)
- Transaction list
  - Category icon & name
  - Description
  - Date
  - Amount (colored)
- Pull to refresh

### 5. Add Transaction Screen
**Route**: `AddTransaction`
- Type toggle (Income/Expense)
- Amount input (large, centered)
- Description input
- Category grid (3 columns)
- Submit button

### 6. Budgets Screen
**Route**: `Main/Budgets`
- Add budget button
- Budget cards
  - Category icon & name
  - Status indicator
  - Spent/Total amounts
  - Progress bar
  - Delete button
- Empty state

**Add Budget Modal**:
- Amount input
- Category selection list
- Create/Cancel buttons

### 7. SMS Screen
**Route**: `Main/SMS`
- Sync status info
- Sync button (🔄)
- Alert card (if uncategorized exist)
- Uncategorized transaction list
  - Description
  - Amount
  - Date
  - Categorize button
- Empty state

**Categorize Modal**:
- Transaction details
- Category selection list
- Cancel button

## Color Coding

### Transaction Types
- **Green** (#4CAF50): Income amounts
- **Red** (#F44336): Expense amounts

### Budget Status
- **Green**: < 70% used (On Track)
- **Orange**: 70-90% used (Warning)
- **Red**: > 90% used (Over Budget)

### UI Elements
- **Purple** (#6200EE): Primary actions
- **Dark Gray** (#1E1E1E): Cards/surfaces
- **Black** (#121212): Background

## Navigation Flow

### User Journey 1: First Time User
1. App Launch → Sign Up Screen
2. Fill form with initial balance
3. Sign Up → Main App (Home)
4. Auto-create default categories
5. Dashboard shows zero state

### User Journey 2: Add Manual Transaction
1. Home → Tap "Add Income/Expense"
2. Add Transaction Screen opens
3. Enter details, select category
4. Submit → Return to Home
5. Transaction appears in list
6. Balance updates

### User Journey 3: SMS Auto-Tracking
1. Navigate to SMS tab
2. Tap "Sync SMS"
3. Grant permissions
4. App reads and parses messages
5. Creates transactions automatically
6. Shows uncategorized for review
7. User categorizes unknowns
8. All transactions appear on Home

### User Journey 4: Create Budget
1. Navigate to Budgets tab
2. Tap "+ Add Budget"
3. Modal opens
4. Enter amount, select category
5. Create → Budget card appears
6. Progress updates as spending occurs

### User Journey 5: Export Report
1. Navigate to Transactions
2. Tap PDF export button (📄)
3. Select period (month/last month/all)
4. PDF generates
5. Share dialog opens
6. Save/share PDF

## Bottom Tab Bar

```
┌──────────┬──────────────┬──────────┬──────────┐
│    🏠    │      📊      │    🎯    │    💬    │
│   Home   │ Transactions │  Budgets │   SMS    │
└──────────┴──────────────┴──────────┴──────────┘
```

## Screen Transitions

- **Stack Navigation**: Push/Pop with slide animation
  - Sign In ↔ Sign Up
  - Main → Add Transaction

- **Tab Navigation**: Instant switch
  - Home ↔ Transactions ↔ Budgets ↔ SMS

- **Modal Presentation**: Slide up from bottom
  - Add Budget
  - Categorize Transaction

## Loading States

- Skeleton screens: None
- Loading text: "Loading...", "Adding...", "Creating..."
- Pull-to-refresh: Native spinner
- Empty states: Icon + message

## Error Handling

- Alerts for errors
- Form validation messages
- Permission denied messages
- Network error handling (N/A - offline app)

## Responsive Design

- Adapts to different screen sizes
- Scrollable content
- Keyboard-aware forms
- Safe area handling (notches)

## Accessibility

- Touch targets: 48x48 dp minimum
- Color contrast: WCAG AA compliant
- Text size: Readable (14-16px body)
- Icons with labels

This app provides a complete, intuitive user experience for personal finance management!
