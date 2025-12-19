import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useStore } from '../store';

interface AddAccountDialogProps {
  open: boolean;
  onClose: () => void;
}

const ACCOUNT_TYPES = [
  { value: 'bank', label: 'Bank Account' },
  { value: 'cash', label: 'Cash' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'investment', label: 'Investment' },
];

export default function AddAccountDialog({ open, onClose }: AddAccountDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { addAccount } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    type: 'bank' as 'cash' | 'bank' | 'credit_card' | 'investment',
    balance: '',
    currency: 'KES',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newAccount = {
      name: formData.name,
      type: formData.type,
      balance: parseFloat(formData.balance) || 0,
      currency: formData.currency,
    };

    addAccount(newAccount);
    setFormData({ name: '', type: 'bank' as 'cash' | 'bank' | 'credit_card' | 'investment', balance: '', currency: 'KES' });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={fullScreen}>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontSize: { xs: '1.15rem', sm: '1.25rem' } }}>Add New Account</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Account Name"
            fullWidth
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., KCB Bank Account"
            sx={{ mb: 2 }}
          />
          <TextField
            select
            margin="dense"
            label="Account Type"
            fullWidth
            required
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'cash' | 'bank' | 'credit_card' | 'investment' })}
            sx={{ mb: 2 }}
          >
            {ACCOUNT_TYPES.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="Initial Balance"
            type="number"
            fullWidth
            required
            value={formData.balance}
            onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
            placeholder="0.00"
            inputProps={{ step: '0.01', min: '0' }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Currency"
            fullWidth
            value={formData.currency}
            disabled
            helperText="Currently only KES is supported"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Add Account
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
