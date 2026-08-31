import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'financeflow_production_super_secret_jwt_key_2026_change_in_prod';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
