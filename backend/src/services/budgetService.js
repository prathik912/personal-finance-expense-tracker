import prisma from '../config/database.js';

export const getBudgetCategories = async (userId) => {
  const categories = await prisma.category.findMany({
    where: {
      OR: [{ userId: null }, { userId }],
      type: 'EXPENSE'
    },
    include: {
      budgets: {
        where: { userId }
      },
      expenses: {
        where: { userId }
      }
    }
  });

  return categories.map(cat => {
    const budget = cat.budgets[0];
    const limit = budget ? parseFloat(budget.amount) : 500;
    const spent = cat.expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

    return {
      id: cat.id,
      name: cat.name,
      limit,
      spent,
      icon: cat.icon,
      color: cat.color
    };
  });
};

export const createBudgetCategory = async (userId, data) => {
  const cat = await prisma.category.create({
    data: {
      userId,
      name: data.name,
      icon: data.icon || 'tag',
      color: data.color || '#2563eb',
      type: 'EXPENSE'
    }
  });

  const now = new Date();
  const budget = await prisma.budget.create({
    data: {
      userId,
      categoryId: cat.id,
      amount: data.limit,
      month: now.getMonth() + 1,
      year: now.getFullYear()
    }
  });

  return {
    id: cat.id,
    name: cat.name,
    limit: parseFloat(budget.amount),
    spent: 0,
    icon: cat.icon,
    color: cat.color
  };
};

export const getBudgetAdjustments = async (userId) => {
  const adjustments = await prisma.budgetAdjustment.findMany({
    where: { userId },
    include: { category: true },
    orderBy: { date: 'desc' }
  });

  return adjustments.map(adj => ({
    id: adj.id,
    category: adj.category.name,
    date: adj.date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    adjustment: adj.adjustment,
    prev: `$${parseFloat(adj.prevLimit).toLocaleString()}`,
    newLimit: `$${parseFloat(adj.newLimit).toLocaleString()}`,
    status: adj.status
  }));
};
