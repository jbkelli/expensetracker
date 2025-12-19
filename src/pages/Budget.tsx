import { useState, useEffect } from 'react';
import { Box, Typography, Paper, LinearProgress, Fab } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useStore } from '../store';
import AddBudgetDialog from '../components/AddBudgetDialog';
import { EXPENSE_CATEGORIES } from '../utils/constants';

export default function Budget() {
  const { budgets, transactions, loadBudgets, loadTransactions } = useStore();
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadBudgets();
    loadTransactions();
  }, [loadBudgets, loadTransactions]);

  // Calculate actual spent for each budget based on transactions
  const budgetsWithSpent = budgets.map(budget => {
    const currentMonth = new Date().getMonth();
    const spent = transactions
      .filter(t => 
        t.type === 'expense' && 
        t.category === budget.categoryId &&
        new Date(t.date).getMonth() === currentMonth
      )
      .reduce((sum, t) => sum + t.amount, 0);
    return { ...budget, spent };
  });

  const getCategoryName = (categoryId: string) => {
    const category = EXPENSE_CATEGORIES.find(c => c.id === categoryId);
    return category ? `${category.icon} ${category.name}` : 'Unknown Category';
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: { xs: 2, sm: 3 }, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}>
        Budget
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 2, sm: 2.5, md: 3 } }}>
        {budgetsWithSpent.length > 0 ? (
          budgetsWithSpent.map((budget) => {
            const progress = (budget.spent / budget.amount) * 100;
            const remaining = budget.amount - budget.spent;
            const isOverBudget = remaining < 0;

            return (
              <Box key={budget.id}>
                <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' }, gap: 1 }}>
                    <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' } }}>{getCategoryName(budget.categoryId)}</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ textTransform: 'capitalize', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      {budget.period}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Spent</Typography>
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Budget</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6" color="error" sx={{ fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' } }}>
                        KSh {budget.spent.toLocaleString('en-KE')}
                      </Typography>
                      <Typography variant="h6" sx={{ fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' } }}>KSh {budget.amount.toLocaleString('en-KE')}</Typography>
                    </Box>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={Math.min(progress, 100)}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      mb: 1,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: isOverBudget ? '#f44336' : progress > 80 ? '#ff9800' : '#4caf50',
                      },
                    }}
                  />

                  <Typography variant="body2" color="textSecondary" align="center">
                    {progress.toFixed(0)}% used • KSh {Math.abs(remaining).toLocaleString('en-KE')}{' '}
                    {isOverBudget ? 'over budget' : 'remaining'}
                  </Typography>
                </Paper>
              </Box>
            );
          })
        ) : (
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary">
                No Budgets Yet
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Set up your first budget to track spending
              </Typography>
            </Paper>
          </Box>
        )}
      </Box>

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

      <AddBudgetDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Box>
  );
}
