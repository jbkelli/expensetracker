import { useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useStore } from '../store';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function Reports() {
  const { transactions, loadTransactions } = useStore();

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyTransactions = transactions.filter((t) => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const expensesByCategory = monthlyTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const chartData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#95E1D3', '#F38181', '#AA96DA'];

  const totalIncome = monthlyTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = monthlyTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netIncome = totalIncome - totalExpenses;

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: { xs: 2, sm: 3 }, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}>
        Reports
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 2, sm: 2.5, md: 3 } }}>
        <Box>
          <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' } }}>
              Monthly Summary
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, gap: 1 }}>
                <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Total Income:</Typography>
                <Typography sx={{ color: '#4caf50', fontWeight: 'bold', fontSize: { xs: '0.875rem', sm: '1rem' }, textAlign: 'right' }}>
                  KSh {totalIncome.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, gap: 1 }}>
                <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Total Expenses:</Typography>
                <Typography sx={{ color: '#f44336', fontWeight: 'bold', fontSize: { xs: '0.875rem', sm: '1rem' }, textAlign: 'right' }}>
                  KSh {totalExpenses.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 2, borderTop: '2px solid #ddd', gap: 1 }}>
                <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' } }}>Net Income:</Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: netIncome >= 0 ? '#4caf50' : '#f44336',
                    fontWeight: 'bold',
                    fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' },
                    textAlign: 'right',
                  }}
                >
                  KSh {netIncome.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        <Box>
          <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' } }}>
              Expenses by Category
            </Typography>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => {
                      const value = ((percent || 0) * 100).toFixed(0);
                      return window.innerWidth < 600 ? `${value}%` : `${name} ${value}%`;
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="textSecondary">No expense data available</Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
