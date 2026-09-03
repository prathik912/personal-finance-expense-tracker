import prisma from '../config/database.js';

export const getUserProfile = async (userId) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      timezone: true,
      avatar: true,
      plan: true,
      createdAt: true
    }
  });
};

export const updateUserProfile = async (userId, data) => {
  try {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        timezone: true,
        avatar: true,
        plan: true
      }
    });
  } catch (error) {
    if (error.code === 'P2002') {
      error.statusCode = 409;
      error.message = 'An account with this email address already exists';
    }
    throw error;
  }
};

export const deleteUserAccount = async (userId) => {
  return await prisma.user.delete({
    where: { id: userId }
  });
};
