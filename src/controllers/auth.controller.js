import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

function formatUser(user) {
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

export async function register(request, response, next) {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      role = 'customer',
    } = request.body ?? {};

    if (
      typeof fullName !== 'string' ||
      !fullName.trim() ||
      typeof email !== 'string' ||
      !email.trim() ||
      typeof password !== 'string' ||
      !password
    ) {
      return response.status(400).json({
        success: false,
        message: 'Full name, email, and password are required',
      });
    }

    if (phone != null && typeof phone !== 'string') {
      return response.status(400).json({
        success: false,
        message: 'Phone must be a string',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const allowedRoles = ['customer', 'seller'];

    if (!allowedRoles.includes(role)) {
      return response.status(400).json({
        success: false,
        message: 'Role must be customer or seller',
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return response.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    const user = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || null,
      password,
      role,
    });
    const token = generateToken(user);

    return response.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: formatUser(user),
        token,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function login(request, response, next) {
  try {
    const { email, password } = request.body ?? {};

    if (
      typeof email !== 'string' ||
      !email.trim() ||
      typeof password !== 'string' ||
      !password
    ) {
      return response.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return response.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!user.isActive) {
      return response.status(403).json({
        success: false,
        message: 'This account has been disabled',
      });
    }

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user);

    return response.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: formatUser(user),
        token,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getCurrentUser(request, response) {
  return response.status(200).json({
    success: true,
    data: {
      user: formatUser(request.user),
    },
  });
}
