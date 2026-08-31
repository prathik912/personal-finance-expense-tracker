import { verifyToken } from '../utils/jwt.js';
import { sendError } from '../utils/response.js';
import prisma from '../config/database.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return sendError(res, 'Authentication token is required. Please sign in.', null, 401);
  }

  try {
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        plan: true
      }
    });

    if (!user) {
      return sendError(res, 'User session invalid or expired.', null, 401);
    }

    req.user = user;
    next();
  } catch (err) {
    return sendError(res, 'Invalid or expired token. Access denied.', null, 403);
  }
};
