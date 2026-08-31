import prisma from '../config/database.js';

export const getIncomes = async (userId) => {
  const incomes = await prisma.income.findMany({
    where: { userId },
    include: { category: true },
    orderBy: { date: 'desc' }
  });

  return incomes.map(inc => ({
    id: inc.id,
    date: inc.date.toISOString().split('T')[0],
    source: inc.source,
    merchant: inc.source,
    note: inc.note || '',
    category: inc.category ? inc.category.name : 'Salary',
    type: 'income',
    amount: parseFloat(inc.amount),
    status: inc.status === 'COMPLETED' ? 'Completed' : 'Pending'
  }));
};

export const createIncome = async (userId, data) => {
  const inc = await prisma.income.create({
    data: {
      userId,
      categoryId: data.categoryId,
      source: data.source,
      note: data.note,
      amount: data.amount,
      date: data.date ? new Date(data.date) : new Date(),
      status: (data.status || 'COMPLETED').toUpperCase()
    },
    include: { category: true }
  });

  return {
    id: inc.id,
    date: inc.date.toISOString().split('T')[0],
    source: inc.source,
    merchant: inc.source,
    note: inc.note || '',
    category: inc.category ? inc.category.name : 'Salary',
    type: 'income',
    amount: parseFloat(inc.amount),
    status: inc.status === 'COMPLETED' ? 'Completed' : 'Pending'
  };
};

export const getIncomeById = async (userId, id) => {
  const inc = await prisma.income.findFirst({
    where: { id, userId }
  });

  if (!inc) {
    const error = new Error('Income record not found');
    error.statusCode = 404;
    throw error;
  }

  return inc;
};

export const updateIncome = async (userId, id, data) => {
  await getIncomeById(userId, id);

  return await prisma.income.update({
    where: { id },
    data: {
      source: data.source,
      note: data.note,
      amount: data.amount,
      categoryId: data.categoryId,
      status: data.status ? data.status.toUpperCase() : undefined
    }
  });
};

export const deleteIncome = async (userId, id) => {
  await getIncomeById(userId, id);

  return await prisma.income.delete({
    where: { id }
  });
};
