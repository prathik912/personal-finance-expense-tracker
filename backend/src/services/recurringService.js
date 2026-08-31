import prisma from '../config/database.js';

export const getRecurringExpenses = async (userId) => {
  return await prisma.recurringExpense.findMany({
    where: { userId },
    include: { category: true },
    orderBy: { nextDueDate: 'asc' }
  });
};

export const createRecurringExpense = async (userId, data) => {
  return await prisma.recurringExpense.create({
    data: {
      userId,
      categoryId: data.categoryId,
      name: data.name,
      amount: data.amount,
      frequency: data.frequency || 'MONTHLY',
      nextDueDate: new Date(data.nextDueDate),
      description: data.description
    }
  });
};

export const getRecurringById = async (userId, id) => {
  const item = await prisma.recurringExpense.findFirst({
    where: { id, userId }
  });

  if (!item) {
    const error = new Error('Recurring expense not found');
    error.statusCode = 404;
    throw error;
  }

  return item;
};

export const updateRecurringExpense = async (userId, id, data) => {
  await getRecurringById(userId, id);

  return await prisma.recurringExpense.update({
    where: { id },
    data: {
      name: data.name,
      amount: data.amount,
      frequency: data.frequency,
      nextDueDate: data.nextDueDate ? new Date(data.nextDueDate) : undefined,
      description: data.description
    }
  });
};

export const deleteRecurringExpense = async (userId, id) => {
  await getRecurringById(userId, id);

  return await prisma.recurringExpense.delete({
    where: { id }
  });
};
