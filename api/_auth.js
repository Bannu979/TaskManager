import jwt from 'jsonwebtoken';
import User from './User';

const JWT_SECRET = process.env.JWT_SECRET;

export async function authenticate(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Authentication required');
  }
  const token = authHeader.replace('Bearer ', '');
  const decoded = jwt.verify(token, JWT_SECRET);
  const user = await User.findByPk(decoded.id);
  if (!user) throw new Error('User not found');
  return user;
} 