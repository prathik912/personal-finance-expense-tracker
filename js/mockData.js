/* ==========================================================================
   FINANCEFLOW REACTIVE STORE WITH REST API DATABASE SYNC
   ========================================================================== */

import { api } from './api.js';

export const initialData = {
  user: null,
  
  stats: {
    totalBalance: 0.00,
    balanceChange: 0,
    monthlyIncome: 0.00,
    incomeChange: 0,
    monthlyExpense: 0.00,
    expenseChange: 0,
    savingsRate: 0,
    savingsRateChange: 0
  },

  transactions: [],
  budgetCategories: [],
  budgetAdjustments: [],
  savingsGoals: [],
  monthlyTrend: [],
  spendingCategoryBreakdown: [],
  connectedAccounts: []
};

// Global Store State - starts with clean initial state
let store = JSON.parse(localStorage.getItem('financeflow_store')) || initialData;

const listeners = [];

export const getStore = () => store;

export const setStoreState = (newState) => {
  store = newState;
  localStorage.setItem('financeflow_store', JSON.stringify(store));
  listeners.forEach(fn => fn(store));
};

export const updateStore = (updater) => {
  store = updater(store);
  localStorage.setItem('financeflow_store', JSON.stringify(store));
  listeners.forEach(fn => fn(store));
};

export const subscribeStore = (fn) => {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx > -1) listeners.splice(idx, 1);
  };
};

export const clearUserSession = () => {
  api.setToken(null);
  localStorage.removeItem('financeflow_store');
  store = { ...initialData };
  listeners.forEach(fn => fn(store));
};

export const fetchRemoteData = async () => {
  if (!api.getToken()) return;

  try {
    const [summaryRes, categoriesRes, goalsRes, userRes] = await Promise.allSettled([
      api.getDashboardSummary(),
      api.getBudgetCategories(),
      api.getSavingsGoals(),
      api.getCurrentUser()
    ]);

    updateStore(prev => {
      const nextUser = (userRes.status === 'fulfilled' && userRes.value?.data?.user) 
        ? userRes.value.data.user 
        : prev.user;

      const nextStats = (summaryRes.status === 'fulfilled' && summaryRes.value?.data?.stats) 
        ? summaryRes.value.data.stats 
        : prev.stats;

      const nextTx = (summaryRes.status === 'fulfilled' && summaryRes.value?.data?.transactions) 
        ? summaryRes.value.data.transactions 
        : prev.transactions;

      const nextBreakdown = (summaryRes.status === 'fulfilled' && summaryRes.value?.data?.spendingCategoryBreakdown) 
        ? summaryRes.value.data.spendingCategoryBreakdown 
        : prev.spendingCategoryBreakdown;

      const nextTrend = (summaryRes.status === 'fulfilled' && summaryRes.value?.data?.monthlyTrend) 
        ? summaryRes.value.data.monthlyTrend 
        : prev.monthlyTrend;

      const nextCategories = (categoriesRes.status === 'fulfilled' && categoriesRes.value?.data) 
        ? categoriesRes.value.data 
        : prev.budgetCategories;

      const nextGoals = (goalsRes.status === 'fulfilled' && goalsRes.value?.data) 
        ? goalsRes.value.data 
        : prev.savingsGoals;

      return {
        ...prev,
        user: nextUser,
        stats: nextStats,
        transactions: nextTx,
        spendingCategoryBreakdown: nextBreakdown,
        monthlyTrend: nextTrend,
        budgetCategories: nextCategories,
        savingsGoals: nextGoals
      };
    });
  } catch (e) {
    console.warn('[Remote Sync] Error synchronizing remote data:', e.message);
  }
};

export const exportTransactionsCSV = () => {
  if (!store.transactions || store.transactions.length === 0) {
    alert('No transactions available to export.');
    return;
  }

  const headers = ['Transaction ID', 'Date', 'Merchant', 'Notes', 'Category', 'Type', 'Amount', 'Status'];
  const rows = store.transactions.map(tx => [
    tx.id, tx.date, `"${tx.merchant || tx.source}"`, `"${tx.note || ''}"`, tx.category, tx.type, tx.amount, tx.status
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `FinanceFlow_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const addTransaction = async (tx) => {
  const amountVal = parseFloat(tx.amount);
  
  if (api.getToken()) {
    try {
      await api.createExpense({
        merchant: tx.merchant,
        amount: amountVal,
        categoryName: tx.category,
        note: tx.note,
        date: tx.date
      });
      await fetchRemoteData();
      return;
    } catch (e) {
      console.warn('API sync failed, updating local state:', e.message);
    }
  }

  // Fallback local update if API is unreachable
  updateStore(prev => {
    const newTx = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      date: tx.date || new Date().toISOString().split('T')[0],
      merchant: tx.merchant,
      note: tx.note || 'Manual Entry',
      category: tx.category,
      type: 'expense',
      amount: amountVal,
      status: 'Completed',
      flag: 'One-Time'
    };

    const updatedCategories = (prev.budgetCategories || []).map(cat => {
      if (cat.name.toLowerCase().includes(tx.category.toLowerCase())) {
        return { ...cat, spent: cat.spent + amountVal };
      }
      return cat;
    });

    const newExpenseTotal = (prev.stats?.monthlyExpense || 0) + amountVal;
    const newBalance = (prev.stats?.totalBalance || 0) - amountVal;

    return {
      ...prev,
      transactions: [newTx, ...(prev.transactions || [])],
      budgetCategories: updatedCategories,
      stats: {
        ...prev.stats,
        monthlyExpense: newExpenseTotal,
        totalBalance: newBalance
      }
    };
  });
};

export const addSavingsGoal = async (goal) => {
  const target = parseFloat(goal.target);
  const current = parseFloat(goal.current || 0);

  if (api.getToken()) {
    try {
      await api.createSavingsGoal({
        title: goal.title,
        category: goal.category,
        targetAmount: target,
        currentAmount: current,
        deadline: goal.deadline
      });
      await fetchRemoteData();
      return;
    } catch (e) {
      console.warn('API sync failed, updating local state:', e.message);
    }
  }

  updateStore(prev => {
    const progress = Math.round((current / target) * 100);
    const newGoal = {
      id: `g${Date.now()}`,
      title: goal.title,
      category: (goal.category || 'GENERAL').toUpperCase(),
      icon: goal.icon || 'target',
      current,
      target,
      deadline: goal.deadline,
      progress,
      status: 'In Progress'
    };
    return {
      ...prev,
      savingsGoals: [...(prev.savingsGoals || []), newGoal]
    };
  });
};

export const addBudgetCategory = async (cat) => {
  const limitVal = parseFloat(cat.limit);

  if (api.getToken()) {
    try {
      await api.createBudgetCategory({
        name: cat.name,
        limit: limitVal
      });
      await fetchRemoteData();
      return;
    } catch (e) {
      console.warn('API sync failed, updating local state:', e.message);
    }
  }

  updateStore(prev => {
    const newCat = {
      id: Date.now(),
      name: cat.name,
      limit: limitVal,
      spent: 0,
      icon: 'tag',
      color: '#2563eb'
    };
    return {
      ...prev,
      budgetCategories: [...(prev.budgetCategories || []), newCat]
    };
  });
};
