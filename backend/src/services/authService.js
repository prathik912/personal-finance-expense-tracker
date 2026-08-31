import prisma from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';

export const registerUser = async (data) => {
  const existing = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (existing) {
    const error = new Error('An account with this email address already exists');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      passwordHash,
      phone: data.phone,
      timezone: data.timezone
    },
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

  const token = generateToken({ id: user.id, email: user.email });

  return { user, token };
};

export const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    const error = new Error('Invalid email or password credentials');
    error.statusCode = 401;
    throw error;
  }

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) {
    const error = new Error('Invalid email or password credentials');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken({ id: user.id, email: user.email });

  const userProfile = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    timezone: user.timezone,
    avatar: user.avatar,
    plan: user.plan
  };

  return { user: userProfile, token };
};
