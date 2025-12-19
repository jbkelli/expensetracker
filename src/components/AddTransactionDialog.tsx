import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { useStore } from '../store';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/constants';

interface AddTransactionDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AddTransactionDialog({ open, onClose }: AddTransactionDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { addTransaction, accounts } = useStore();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleSubmit = () => {
    if (!amount || !category || !description || !accountId) {
      alert('Please fill in all fields');
      return;
    }

    const transaction = {
      type,
      amount: parseFloat(amount),
      category,
      description,
      date: new Date(date),
      accountId,
    };

    addTransaction(transaction);

    // Reset form
    setAmount('');
    setCategory('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={fullScreen}>
      <DialogTitle sx={{ fontSize: { xs: '1.15rem', sm: '1.25rem' } }}>Add Transaction</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <ToggleButtonGroup
            value={type}
            exclusive
            onChange={(_, newType) => {
              if (newType) {
                setType(newType);
                setCategory('');
              }
            }}
            fullWidth
          >
            <ToggleButton value="expense" color="error">
              <TrendingDown sx={{ mr: 1 }} />
              Expense
            </ToggleButton>
            <ToggleButton value="income" color="success">
              <TrendingUp sx={{ mr: 1 }} />
              Income
            </ToggleButton>
          </ToggleButtonGroup>

          <TextField
            label="Amount (KSh)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
            required
          />

          <TextField
            label="Category"
            select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            fullWidth
            required
          >
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.name}>
                {cat.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            required
          />

          <TextField
            label="Account"
            select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            fullWidth
            required
          >
            {accounts.map((account) => (
              <MenuItem key={account.id} value={account.id}>
                {account.name} (KSh {account.balance.toLocaleString()})
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Add Transaction
        </Button>
      </DialogActions>
    </Dialog>
  );
}
