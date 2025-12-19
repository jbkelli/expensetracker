import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  Divider,
  Button,
  Card,
  CardContent,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  AccountBalance,
  Category,
  Notifications,
  DarkMode,
  CloudDownload,
  Add,
  Delete,
} from '@mui/icons-material';
import { useStore } from '../store';
import { supabase } from '../services/supabase';
import AddAccountDialog from '../components/AddAccountDialog';
import AddBudgetDialog from '../components/AddBudgetDialog';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/constants';

interface SettingsProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export default function Settings({ darkMode, setDarkMode }: SettingsProps) {
  const { accounts, deleteAccount, budgets, loadAccounts } = useStore();
  const [notifications, setNotifications] = useState(true);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);

  // Load settings and accounts on mount
  useEffect(() => {
    loadAccounts();
    loadUserSettings();
  }, [loadAccounts]);

  const loadUserSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!error && data) {
      setDarkMode(data.dark_mode);
      setNotifications(data.notifications_enabled);
    }
  };

  const saveUserSettings = async (key: string, value: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        [key]: value,
      });
  };

  const handleDarkModeToggle = (value: boolean) => {
    setDarkMode(value);
    saveUserSettings('dark_mode', value);
  };

  const handleNotificationsToggle = (value: boolean) => {
    setNotifications(value);
    saveUserSettings('notifications_enabled', value);
  };

  const handleDeleteAccount = (id: string) => {
    setAccountToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (accountToDelete) {
      deleteAccount(accountToDelete);
      setAccountToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleExportData = () => {
    const { transactions } = useStore.getState();
    const currentDate = new Date().toLocaleDateString('en-KE', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Calculate totals
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalIncome - totalExpenses;

    // Create CSV content
    let csvContent = `Expense Tracker Report\nGenerated: ${currentDate}\n\n`;
    
    csvContent += `SUMMARY\n`;
    csvContent += `Total Income,KSh ${totalIncome.toLocaleString('en-KE', { minimumFractionDigits: 2 })}\n`;
    csvContent += `Total Expenses,KSh ${totalExpenses.toLocaleString('en-KE', { minimumFractionDigits: 2 })}\n`;
    csvContent += `Net Balance,KSh ${netBalance.toLocaleString('en-KE', { minimumFractionDigits: 2 })}\n\n`;

    csvContent += `ACCOUNTS\n`;
    csvContent += `Account Name,Type,Balance,Currency\n`;
    accounts.forEach(acc => {
      csvContent += `"${acc.name}",${acc.type.replace('_', ' ')},KSh ${acc.balance.toLocaleString('en-KE', { minimumFractionDigits: 2 })},${acc.currency}\n`;
    });

    csvContent += `\nTRANSACTIONS\n`;
    csvContent += `Date,Type,Category,Amount,Description,Account\n`;
    transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .forEach(txn => {
        const account = accounts.find(a => a.id === txn.accountId);
        const date = new Date(txn.date).toLocaleDateString('en-KE');
        csvContent += `${date},${txn.type},${txn.category},"KSh ${txn.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}","${txn.description}","${account?.name || 'Unknown'}"\n`;
      });

    csvContent += `\nBUDGETS\n`;
    csvContent += `Category,Period,Budget Amount,Spent,Remaining\n`;
    budgets.forEach(budget => {
      const remaining = budget.amount - budget.spent;
      csvContent += `${budget.categoryId},${budget.period},"KSh ${budget.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}","KSh ${budget.spent.toLocaleString('en-KE', { minimumFractionDigits: 2 })}","KSh ${remaining.toLocaleString('en-KE', { minimumFractionDigits: 2 })}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-tracker-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 0.5, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}>
          Settings
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          Manage your accounts, preferences, and app settings
        </Typography>
      </Box>

      {/* Manage Accounts Section */}
      <Paper sx={{ mb: { xs: 2, sm: 2.5, md: 3 }, p: { xs: 2, sm: 2.5, md: 3 }, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 2, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 0 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountBalance sx={{ fontSize: { xs: 20, sm: 24 } }} />
            <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' } }}>Manage Accounts</Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setAccountDialogOpen(true)}
            size="small"
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Add Account
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {accounts.length === 0 ? (
          <Typography color="textSecondary" sx={{ textAlign: 'center', py: 3 }}>
            No accounts yet. Add your first account to get started!
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {accounts.map((account) => (
              <Card key={account.id} variant="outlined" sx={{ 
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: '0 4px 12px rgba(46, 125, 50, 0.15)',
                }
              }}>
                <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 0 }, p: { xs: 2, sm: 2.5, md: 3 } }}>
                  <Box sx={{ flex: 1, width: '100%' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' } }}>{account.name}</Typography>
                    <Typography color="textSecondary" variant="body2" sx={{ textTransform: 'capitalize', mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      {account.type.replace('_', ' ')}
                    </Typography>
                    <Typography variant="h5" sx={{ mt: 1, color: account.balance >= 0 ? 'success.main' : 'error.main', fontWeight: 'bold', fontSize: { xs: '1.15rem', sm: '1.35rem', md: '1.5rem' } }}>
                      KSh {account.balance.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteAccount(account.id)}
                    title="Delete account"
                    sx={{
                      alignSelf: { xs: 'flex-end', sm: 'center' },
                      '&:hover': {
                        backgroundColor: 'rgba(211, 47, 47, 0.1)',
                      }
                    }}
                  >
                    <Delete />
                  </IconButton>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Paper>

      {/* Categories Section */}
      <Paper sx={{ mb: { xs: 2, sm: 2.5, md: 3 }, p: { xs: 2, sm: 2.5, md: 3 }, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Category sx={{ fontSize: { xs: 20, sm: 24 } }} />
          <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' } }}>Categories</Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            Expense Categories
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {EXPENSE_CATEGORIES.map((category) => (
              <Chip
                key={category.id}
                label={`${category.icon} ${category.name}`}
                variant="outlined"
                color="error"
                size="small"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              />
            ))}
          </Box>
        </Box>
        <Box>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            Income Categories
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {INCOME_CATEGORIES.map((category) => (
              <Chip
                key={category.id}
                label={`${category.icon} ${category.name}`}
                variant="outlined"
                color="success"
                size="small"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              />
            ))}
          </Box>
        </Box>
      </Paper>

      {/* App Settings */}
      <Paper sx={{ borderRadius: 3 }}>
        <List>
          <ListItem sx={{ py: { xs: 1.5, sm: 2 } }}>
            <ListItemIcon sx={{ minWidth: { xs: 40, sm: 56 } }}>
              <Notifications sx={{ fontSize: { xs: 20, sm: 24 } }} />
            </ListItemIcon>
            <ListItemText
              primary={<Typography sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>Notifications</Typography>}
              secondary={<Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Enable budget and payment reminders</Typography>}
            />
            <Switch checked={notifications} onChange={(e) => handleNotificationsToggle(e.target.checked)} />
          </ListItem>
          <Divider />
          <ListItem sx={{ py: { xs: 1.5, sm: 2 } }}>
            <ListItemIcon sx={{ minWidth: { xs: 40, sm: 56 } }}>
              <DarkMode sx={{ fontSize: { xs: 20, sm: 24 } }} />
            </ListItemIcon>
            <ListItemText 
              primary={<Typography sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>Dark Mode</Typography>} 
              secondary={<Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Switch between light and dark theme</Typography>} 
            />
            <Switch checked={darkMode} onChange={(e) => handleDarkModeToggle(e.target.checked)} />
          </ListItem>
          <Divider />
          <ListItem component="div" sx={{ cursor: 'pointer', py: { xs: 1.5, sm: 2 } }} onClick={handleExportData}>
            <ListItemIcon sx={{ minWidth: { xs: 40, sm: 56 } }}>
              <CloudDownload sx={{ fontSize: { xs: 20, sm: 24 } }} />
            </ListItemIcon>
            <ListItemText
              primary={<Typography sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>Export Data</Typography>}
              secondary={<Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Download your financial report as CSV (Excel-compatible)</Typography>}
            />
          </ListItem>
        </List>
      </Paper>

      {/* Dialogs */}
      <AddAccountDialog open={accountDialogOpen} onClose={() => setAccountDialogOpen(false)} />
      <AddBudgetDialog open={budgetDialogOpen} onClose={() => setBudgetDialogOpen(false)} />
      
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Account?</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this account? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
