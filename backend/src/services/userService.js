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
  return await prisma.user.update({
    where: { id: userId },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      timezone: data.timezone,
      avatar: data.avatar
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
};

export const deleteUserAccount = async (userId) => {
  return await prisma.user.delete({
    where: { id: userId }
  });
};
