import prisma from '../config/database.js';

export const getExpenses = async (userId, filters = {}) => {
  const where = { userId };

  if (filters.category) {
    where.category = { name: { contains: filters.category, mode: 'insensitive' } };
  }

  if (filters.search) {
    where.OR = [
      { merchant: { contains: filters.search, mode: 'insensitive' } },
      { note: { contains: filters.search, mode: 'insensitive' } }
    ];
  }

  if (filters.status) {
    where.status = filters.status.toUpperCase();
  }

  const expenses = await prisma.expense.findMany({
    where,
    include: {
      category: true
    },
    orderBy: { date: 'desc' }
  });

  return expenses.map(exp => ({
    id: exp.id,
    date: exp.date.toISOString().split('T')[0],
    merchant: exp.merchant,
    note: exp.note || '',
    category: exp.category ? exp.category.name : 'General',
    type: 'expense',
    amount: parseFloat(exp.amount),
    status: exp.status === 'COMPLETED' ? 'Completed' : 'Pending',
    flag: exp.flag === 'RECURRING' ? 'Recurring' : 'One-Time'
  }));
};

export const createExpense = async (userId, data) => {
  let categoryId = data.categoryId;

  if (!categoryId && data.categoryName) {
    let cat = await prisma.category.findFirst({
      where: {
        name: { equals: data.categoryName, mode: 'insensitive' },
        OR: [{ userId: null }, { userId }]
      }
    });

    if (!cat) {
      cat = await prisma.category.create({
        data: {
          name: data.categoryName,
          userId,
          type: 'EXPENSE'
        }
      });
    }
    categoryId = cat.id;
  }

  const exp = await prisma.expense.create({
    data: {
      userId,
      categoryId,
      merchant: data.merchant,
      note: data.note,
      amount: data.amount,
      date: data.date ? new Date(data.date) : new Date(),
      status: (data.status || 'COMPLETED').toUpperCase(),
      flag: (data.flag || 'ONE_TIME').toUpperCase()
    },
    include: {
      category: true
    }
  });

  return {
    id: exp.id,
    date: exp.date.toISOString().split('T')[0],
    merchant: exp.merchant,
    note: exp.note || '',
    category: exp.category ? exp.category.name : 'General',
    type: 'expense',
    amount: parseFloat(exp.amount),
    status: exp.status === 'COMPLETED' ? 'Completed' : 'Pending',
    flag: exp.flag === 'RECURRING' ? 'Recurring' : 'One-Time'
  };
};

export const getExpenseById = async (userId, id) => {
  const exp = await prisma.expense.findFirst({
    where: { id, userId },
    include: { category: true }
  });

  if (!exp) {
    const error = new Error('Expense record not found');
    error.statusCode = 404;
    throw error;
  }

  return exp;
};

export const updateExpense = async (userId, id, data) => {
  await getExpenseById(userId, id);

  return await prisma.expense.update({
    where: { id },
    data: {
      merchant: data.merchant,
      note: data.note,
      amount: data.amount,
      categoryId: data.categoryId,
      status: data.status ? data.status.toUpperCase() : undefined,
      flag: data.flag ? data.flag.toUpperCase() : undefined
    }
  });
};

export const deleteExpense = async (userId, id) => {
  await getExpenseById(userId, id);

  return await prisma.expense.delete({
    where: { id }
  });
};
