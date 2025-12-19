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
import { EXPENSE_CATEGORIES } from '../utils/constants';

interface AddBudgetDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AddBudgetDialog({ open, onClose }: AddBudgetDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { addBudget } = useStore();
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    period: 'monthly',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const newBudget = {
      categoryId: formData.categoryId,
      amount: parseFloat(formData.amount),
      period: formData.period as 'weekly' | 'monthly' | 'yearly',
      startDate,
      endDate,
      spent: 0,
    };

    addBudget(newBudget);
    setFormData({ categoryId: '', amount: '', period: 'monthly' });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={fullScreen}>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontSize: { xs: '1.15rem', sm: '1.25rem' } }}>Create Budget</DialogTitle>
        <DialogContent>
          <TextField
            select
            margin="dense"
            label="Category"
            fullWidth
            required
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            sx={{ mb: 2 }}
          >
            {EXPENSE_CATEGORIES.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.icon} {category.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="Budget Amount (KSh)"
            type="number"
            fullWidth
            required
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="10000.00"
            inputProps={{ step: '0.01', min: '0' }}
            sx={{ mb: 2 }}
          />
          <TextField
            select
            margin="dense"
            label="Period"
            fullWidth
            required
            value={formData.period}
            onChange={(e) => setFormData({ ...formData, period: e.target.value })}
          >
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
            <MenuItem value="yearly">Yearly</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Create Budget
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
