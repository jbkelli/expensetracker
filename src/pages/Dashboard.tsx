import React, { useEffect } from 'react';
import { Paper, Typography, Box, Card, CardContent } from '@mui/material';
import { TrendingUp, TrendingDown, AccountBalanceWallet, Receipt } from '@mui/icons-material';
import { useStore } from '../store';

export default function Dashboard() {
  const { transactions, accounts, loadTransactions, loadAccounts } = useStore();

  useEffect(() => {
    loadAccounts();
    loadTransactions();
  }, [loadAccounts, loadTransactions]);

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyTransactions = transactions.filter((t) => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const monthlyIncome = monthlyTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = monthlyTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const StatCard = ({ title, value, icon, color }: any) => (
    <Card sx={{ 
      height: '100%',
      background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
      border: `1px solid ${color}30`,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 8px 16px ${color}30`,
      }
    }}>
      <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography color="textSecondary" gutterBottom variant="body2" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' } }}>
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color, mt: 1, fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' }, wordBreak: 'break-word' }}>
              KSh {value.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </Box>
          <Box sx={{ 
            color, 
            opacity: 0.8,
            p: { xs: 1, sm: 1.25, md: 1.5 },
            borderRadius: '12px',
            backgroundColor: `${color}15`,
            flexShrink: 0,
            ml: 1,
          }}>
            {React.cloneElement(icon, { sx: { fontSize: { xs: 28, sm: 34, md: 40 } } })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 2, sm: 3, md: 4 } }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 0.5, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}>
            Dashboard
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Welcome back! Here's your financial overview
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3, mb: 3 }}>
        <Box>
          <StatCard
            title="Total Balance"
            value={totalBalance}
            icon={<AccountBalanceWallet sx={{ fontSize: 40 }} />}
            color="#1976d2"
          />
        </Box>
        <Box>
          <StatCard
            title="Monthly Income"
            value={monthlyIncome}
            icon={<TrendingUp sx={{ fontSize: 40 }} />}
            color="#4caf50"
          />
        </Box>
        <Box>
          <StatCard
            title="Monthly Expenses"
            value={monthlyExpenses}
            icon={<TrendingDown sx={{ fontSize: 40 }} />}
            color="#f44336"
          />
        </Box>
      </Box>

      <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 }, borderRadius: 3, background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 1.5, sm: 2 } }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' } }}>
            Recent Transactions
          </Typography>
        </Box>
        {transactions.length > 0 ? (
          transactions.slice(0, 5).map((transaction) => {
            const account = accounts.find(a => a.id === transaction.accountId);
            return (
              <Box
                key={transaction.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: { xs: 1.5, sm: 2 },
                  px: { xs: 1.5, sm: 2 },
                  mb: 1,
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    transform: 'translateX(4px)',
                  },
                  flexWrap: { xs: 'wrap', sm: 'nowrap' },
                  gap: { xs: 1, sm: 0 },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 }, flex: 1, minWidth: 0 }}>
                  <Box sx={{
                    p: { xs: 0.75, sm: 1 },
                    borderRadius: '8px',
                    backgroundColor: transaction.type === 'income' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                    flexShrink: 0,
                  }}>
                    {transaction.type === 'income' ? (
                      <TrendingUp sx={{ color: '#4CAF50', fontSize: { xs: 20, sm: 24 } }} />
                    ) : (
                      <TrendingDown sx={{ color: '#F44336', fontSize: { xs: 20, sm: 24 } }} />
                    )}
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {transaction.description}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {transaction.category} • {account?.name || 'Unknown'}
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: transaction.type === 'income' ? '#4CAF50' : '#F44336',
                    fontWeight: 'bold',
                    fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' },
                    flexShrink: 0,
                    textAlign: { xs: 'right', sm: 'left' },
                  }}
                >
                  {transaction.type === 'income' ? '+' : '-'}KSh {transaction.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
            );
          })
        ) : (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Receipt sx={{ fontSize: 64, opacity: 0.5, mb: 2 }} />
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              No transactions yet
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.7, mt: 1 }}>
              Start tracking by adding your first transaction
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
