import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Chip,
  Card,
  CardContent,
  Fab,
} from '@mui/material';
import { Add, Search } from '@mui/icons-material';
import { useStore } from '../store';
import AddTransactionDialog from '../components/AddTransactionDialog';

export default function Transactions() {
  const { transactions, loadTransactions } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: { xs: 2, sm: 3 }, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}>
        Transactions
      </Typography>

      <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: { xs: 2, sm: 3 } }}>
        <TextField
          fullWidth
          placeholder="Search transactions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label="All"
            onClick={() => setFilterType('all')}
            color={filterType === 'all' ? 'primary' : 'default'}
            sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
          />
          <Chip
            label="Income"
            onClick={() => setFilterType('income')}
            color={filterType === 'income' ? 'primary' : 'default'}
            sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
          />
          <Chip
            label="Expenses"
            onClick={() => setFilterType('expense')}
            color={filterType === 'expense' ? 'primary' : 'default'}
            sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
          />
        </Box>
      </Paper>

      {filteredTransactions.length > 0 ? (
        filteredTransactions.map((transaction) => (
          <Card key={transaction.id} sx={{ mb: 2 }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: { xs: 'wrap', sm: 'nowrap' }, gap: { xs: 1, sm: 2 } }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{transaction.description}</Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                  </Typography>
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    color: transaction.type === 'income' ? '#4caf50' : '#f44336',
                    fontWeight: 'bold',
                    fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                    flexShrink: 0,
                    textAlign: 'right',
                  }}
                >
                  {transaction.type === 'income' ? '+' : '-'}KSh {transaction.amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No transactions found
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Start by adding your first transaction
          </Typography>
        </Paper>
      )}

      <Fab
        color="primary"
        aria-label="add"
        sx={{ 
          position: 'fixed', 
          bottom: { xs: 16, sm: 20, md: 24 }, 
          right: { xs: 16, sm: 20, md: 24 },
          width: { xs: 48, sm: 52, md: 56 },
          height: { xs: 48, sm: 52, md: 56 },
          background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
          boxShadow: '0 8px 16px rgba(46, 125, 50, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
            boxShadow: '0 12px 24px rgba(46, 125, 50, 0.4)',
            transform: 'scale(1.05)',
          },
          transition: 'all 0.3s ease',
        }}
        onClick={() => setDialogOpen(true)}
      >
        <Add />
      </Fab>

      <AddTransactionDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Box>
  );
}
