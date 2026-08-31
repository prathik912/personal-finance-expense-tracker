import prisma from '../config/database.js';

export const getSavingsGoals = async (userId) => {
  const goals = await prisma.savingsGoal.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

  return goals.map(goal => {
    const target = parseFloat(goal.targetAmount);
    const current = parseFloat(goal.currentAmount);
    const progress = Math.round((current / target) * 100);

    return {
      id: goal.id,
      title: goal.title,
      category: goal.category,
      icon: goal.icon,
      current,
      target,
      deadline: goal.deadline.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      progress,
      status: goal.status
    };
  });
};

export const createSavingsGoal = async (userId, data) => {
  const goal = await prisma.savingsGoal.create({
    data: {
      userId,
      title: data.title,
      category: (data.category || 'GENERAL').toUpperCase(),
      icon: data.icon || 'target',
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount || 0,
      deadline: new Date(data.deadline)
    }
  });

  const target = parseFloat(goal.targetAmount);
  const current = parseFloat(goal.currentAmount);
  const progress = Math.round((current / target) * 100);

  return {
    id: goal.id,
    title: goal.title,
    category: goal.category,
    icon: goal.icon,
    current,
    target,
    deadline: goal.deadline.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    progress,
    status: goal.status
  };
};

export const getGoalById = async (userId, id) => {
  const goal = await prisma.savingsGoal.findFirst({
    where: { id, userId }
  });

  if (!goal) {
    const error = new Error('Savings goal not found');
    error.statusCode = 404;
    throw error;
  }

  return goal;
};

export const updateSavingsGoal = async (userId, id, data) => {
  await getGoalById(userId, id);

  return await prisma.savingsGoal.update({
    where: { id },
    data: {
      title: data.title,
      category: data.category ? data.category.toUpperCase() : undefined,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      status: data.status
    }
  });
};

export const deleteSavingsGoal = async (userId, id) => {
  await getGoalById(userId, id);

  return await prisma.savingsGoal.delete({
    where: { id }
  });
};
