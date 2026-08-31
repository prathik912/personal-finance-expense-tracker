import prisma from '../config/database.js';

export const getDashboardSummary = async (userId) => {
  const expenses = await prisma.expense.findMany({
    where: { userId },
    include: { category: true },
    orderBy: { date: 'desc' }
  });

  const incomes = await prisma.income.findMany({
    where: { userId },
    include: { category: true },
    orderBy: { date: 'desc' }
  });

  const totalExpense = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const totalIncome = incomes.reduce((sum, i) => sum + parseFloat(i.amount), 0);
  const totalBalance = totalIncome - totalExpense; // 100% database calculated balance

  const savingsRate = totalIncome > 0 
    ? Math.max(0, Math.min(100, Math.round(((totalIncome - totalExpense) / totalIncome) * 100))) 
    : 0;

  // Format recent transactions from real database records
  const formattedExpenses = expenses.map(e => ({
    id: e.id,
    date: e.date.toISOString().split('T')[0],
    merchant: e.merchant,
    note: e.note || '',
    category: e.category ? e.category.name : 'General',
    type: 'expense',
    amount: parseFloat(e.amount),
    status: e.status === 'COMPLETED' ? 'Completed' : 'Pending',
    flag: e.flag === 'RECURRING' ? 'Recurring' : 'One-Time'
  }));

  const formattedIncomes = incomes.map(i => ({
    id: i.id,
    date: i.date.toISOString().split('T')[0],
    merchant: i.source,
    note: i.note || '',
    category: i.category ? i.category.name : 'Salary',
    type: 'income',
    amount: parseFloat(i.amount),
    status: i.status === 'COMPLETED' ? 'Completed' : 'Pending',
    flag: 'One-Time'
  }));

  const transactions = [...formattedExpenses, ...formattedIncomes]
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Category Breakdown Calculation from actual expenses
  const categoryTotals = {};
  expenses.forEach(e => {
    const catName = e.category ? e.category.name : 'Uncategorized';
    categoryTotals[catName] = (categoryTotals[catName] || 0) + parseFloat(e.amount);
  });

  const categoryColors = {
    Housing: '#2563eb',
    Dining: '#10b981',
    Transport: '#8b5cf6',
    Savings: '#06b6d4',
    Leisure: '#94a3b8',
    Groceries: '#10b981',
    Software: '#8b5cf6',
    Uncategorized: '#94a3b8'
  };

  const spendingCategoryBreakdown = Object.keys(categoryTotals).map(name => {
    const amount = categoryTotals[name];
    const percentage = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
    return {
      name,
      percentage,
      amount,
      color: categoryColors[name] || '#2563eb'
    };
  });

  // Calculate monthly trends from user's expense and income history
  const monthlyData = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  incomes.forEach(inc => {
    const month = monthNames[inc.date.getMonth()];
    if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0 };
    monthlyData[month].income += parseFloat(inc.amount);
  });

  expenses.forEach(exp => {
    const month = monthNames[exp.date.getMonth()];
    if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0 };
    monthlyData[month].expense += parseFloat(exp.amount);
  });

  const monthlyTrend = Object.keys(monthlyData).map(month => ({
    month,
    income: monthlyData[month].income,
    expense: monthlyData[month].expense,
    savings: Math.max(0, monthlyData[month].income - monthlyData[month].expense)
  }));

  return {
    stats: {
      totalBalance,
      balanceChange: 0,
      monthlyIncome: totalIncome,
      incomeChange: 0,
      monthlyExpense: totalExpense,
      expenseChange: 0,
      savingsRate,
      savingsRateChange: 0
    },
    transactions,
    monthlyTrend,
    spendingCategoryBreakdown
  };
};
