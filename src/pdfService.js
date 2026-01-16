import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { format } from 'date-fns';

export const generatePDFReport = async (user, transactions, startDate, endDate, budgets = []) => {
  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // Group transactions by category
  const categoryTotals = {};
  transactions.forEach(t => {
    if (t.category_name) {
      if (!categoryTotals[t.category_name]) {
        categoryTotals[t.category_name] = {
          total: 0,
          type: t.type,
          icon: t.category_icon,
          color: t.category_color,
        };
      }
      categoryTotals[t.category_name].total += t.amount;
    }
  });

  // Generate HTML
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>CashKelli Report</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            padding: 40px;
            color: #333;
            background: #fff;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #6200EE;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #6200EE;
            font-size: 32px;
            margin-bottom: 10px;
          }
          .header p {
            color: #666;
            font-size: 14px;
          }
          .summary {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 40px;
          }
          .summary-card {
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border: 2px solid #e0e0e0;
          }
          .summary-card h3 {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
            text-transform: uppercase;
          }
          .summary-card .amount {
            font-size: 24px;
            font-weight: bold;
          }
          .income { color: #4CAF50; }
          .expense { color: #F44336; }
          .balance { color: #6200EE; }
          .section {
            margin-bottom: 40px;
          }
          .section h2 {
            color: #333;
            font-size: 20px;
            margin-bottom: 20px;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th {
            background: #f5f5f5;
            padding: 12px;
            text-align: left;
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            border-bottom: 2px solid #e0e0e0;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #f0f0f0;
            font-size: 14px;
          }
          .category-icon {
            font-size: 20px;
            margin-right: 8px;
          }
          .footer {
            margin-top: 60px;
            text-align: center;
            color: #999;
            font-size: 12px;
            border-top: 1px solid #e0e0e0;
            padding-top: 20px;
          }
          .budget-item {
            display: flex;
            justify-content: space-between;
            padding: 15px;
            margin-bottom: 10px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
          }
          .budget-progress {
            width: 100%;
            height: 8px;
            background: #f0f0f0;
            border-radius: 4px;
            margin-top: 8px;
            overflow: hidden;
          }
          .budget-bar {
            height: 100%;
            background: #6200EE;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>💰 CashKelli Report</h1>
          <p>${user.name} (${user.email})</p>
          <p>Period: ${format(new Date(startDate), 'MMM dd, yyyy')} - ${format(new Date(endDate), 'MMM dd, yyyy')}</p>
          <p>Generated on ${format(new Date(), 'MMM dd, yyyy HH:mm')}</p>
        </div>

        <div class="summary">
          <div class="summary-card">
            <h3>Total Income</h3>
            <div class="amount income">KSh ${totalIncome.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div class="summary-card">
            <h3>Total Expenses</h3>
            <div class="amount expense">KSh ${totalExpense.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div class="summary-card">
            <h3>Net Balance</h3>
            <div class="amount balance">KSh ${netBalance.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </div>

        ${Object.keys(categoryTotals).length > 0 ? `
        <div class="section">
          <h2>Spending by Category</h2>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Type</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(categoryTotals)
                .sort((a, b) => b[1].total - a[1].total)
                .map(([name, data]) => `
                  <tr>
                    <td><span class="category-icon">${data.icon}</span>${name}</td>
                    <td>${data.type === 'income' ? '📈 Income' : '📉 Expense'}</td>
                    <td style="text-align: right; font-weight: bold; color: ${data.type === 'income' ? '#4CAF50' : '#F44336'}">
                      KSh ${data.total.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${budgets.length > 0 ? `
        <div class="section">
          <h2>Budget Status</h2>
          ${budgets.map(budget => {
            const percentage = Math.min((budget.spent / budget.amount) * 100, 100);
            return `
              <div class="budget-item">
                <div style="flex: 1;">
                  <div><span class="category-icon">${budget.category_icon}</span><strong>${budget.category_name || 'General'}</strong></div>
                  <div style="margin-top: 8px; font-size: 12px; color: #666;">
                    KSh ${budget.spent.toLocaleString('en-KE', { minimumFractionDigits: 2 })} of KSh ${budget.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                    (${percentage.toFixed(0)}%)
                  </div>
                  <div class="budget-progress">
                    <div class="budget-bar" style="width: ${percentage}%; background: ${percentage > 90 ? '#F44336' : percentage > 70 ? '#FF9800' : '#4CAF50'}"></div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        ` : ''}

        <div class="section">
          <h2>All Transactions (${transactions.length})</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.map(t => `
                <tr>
                  <td>${format(new Date(t.date), 'MMM dd, yyyy')}</td>
                  <td><span class="category-icon">${t.category_icon || '📦'}</span>${t.category_name || 'Uncategorized'}</td>
                  <td>${t.description}</td>
                  <td style="text-align: right; font-weight: bold; color: ${t.type === 'income' ? '#4CAF50' : '#F44336'}">
                    ${t.type === 'income' ? '+' : '-'} KSh ${t.amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>Generated by CashKelli App</p>
          <p>Current Balance: KSh ${user.current_balance.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </body>
    </html>
  `;

  try {
    // Generate PDF
    const { uri } = await Print.printToFileAsync({ html });

    // Share the PDF
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Expense Report',
        UTI: 'com.adobe.pdf',
      });
    }

    return uri;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
