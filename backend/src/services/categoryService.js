import prisma from '../config/database.js';

export const getCategories = async (userId) => {
  return await prisma.category.findMany({
    where: {
      OR: [{ userId: null }, { userId }]
    },
    orderBy: { name: 'asc' }
  });
};

export const createCategory = async (userId, data) => {
  return await prisma.category.create({
    data: {
      userId,
      name: data.name,
      icon: data.icon || 'tag',
      color: data.color || '#2563eb',
      type: (data.type || 'EXPENSE').toUpperCase()
    }
  });
};

export const getCategoryById = async (userId, id) => {
  const category = await prisma.category.findFirst({
    where: {
      id,
      OR: [{ userId: null }, { userId }]
    }
  });

  if (!category) {
    const error = new Error('Category not found');
    error.statusCode = 404;
    throw error;
  }

  return category;
};

export const updateCategory = async (userId, id, data) => {
  const category = await getCategoryById(userId, id);
  if (!category.userId) {
    const error = new Error('Cannot modify global default categories');
    error.statusCode = 403;
    throw error;
  }

  return await prisma.category.update({
    where: { id },
    data: {
      name: data.name,
      icon: data.icon,
      color: data.color
    }
  });
};

export const deleteCategory = async (userId, id) => {
  const category = await getCategoryById(userId, id);
  if (!category.userId) {
    const error = new Error('Cannot delete global default categories');
    error.statusCode = 403;
    throw error;
  }

  return await prisma.category.delete({
    where: { id }
  });
};
