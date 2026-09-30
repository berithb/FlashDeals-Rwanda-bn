import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function protect(request, response, next) {
  try {
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader?.startsWith('Bearer ')) {
      return response.status(401).json({
        success: false,
        message: 'Authentication token is required',
      });
    }

    const token = authorizationHeader.slice('Bearer '.length).trim();

    if (!token) {
      return response.status(401).json({
        success: false,
        message: 'Authentication token is required',
      });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (
      typeof decodedToken === 'string' ||
      typeof decodedToken.userId !== 'string'
    ) {
      return response.status(401).json({
        success: false,
        message: 'Authentication token is invalid',
      });
    }

    const user = await User.findById(decodedToken.userId);

    if (!user) {
      return response.status(401).json({
        success: false,
        message: 'The user associated with this token no longer exists',
      });
    }

    if (!user.isActive) {
      return response.status(403).json({
        success: false,
        message: 'This account has been disabled',
      });
    }

    request.user = user;

    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return response.status(401).json({
        success: false,
        message: 'Authentication token has expired',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return response.status(401).json({
        success: false,
        message: 'Authentication token is invalid',
      });
    }

    return next(error);
  }
}

export function authorizeRoles(...allowedRoles) {
  return function roleAuthorization(request, response, next) {
    if (!request.user) {
      return response.status(401).json({
        success: false,
        message: 'Authentication is required',
      });
    }

    if (!allowedRoles.includes(request.user.role)) {
      return response.status(403).json({
        success: false,
        message: `This action requires one of these roles: ${allowedRoles.join(', ')}`,
      });
    }

    return next();
  };
}
