import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';
import { sendSuccess, sendCreated, sendError } from '../utils/response';
import { cache } from '../redis/cache';
import { AppError } from '../middleware/errorHandler';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password, role } = req.body;

      const exists = await User.findOne({ email });
      if (exists) {
        sendError(res, 'Email already registered', 409);
        return;
      }

      const user = await User.create({ name, email, password, role: role ?? 'user' });

      const accessToken = generateAccessToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });
      const refreshToken = generateRefreshToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });

      sendCreated(res, { user, accessToken, refreshToken }, 'Account created successfully');
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email, isActive: true }).select('+password +refreshToken');
      if (!user || !(await user.comparePassword(password))) {
        sendError(res, 'Invalid email or password', 401);
        return;
      }

      const accessToken = generateAccessToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });
      const refreshToken = generateRefreshToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      user.refreshToken = refreshToken;
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });

      const userObj = user.toJSON();
      sendSuccess(res, { user: userObj, accessToken, refreshToken }, 'Login successful');
    } catch (error) {
      next(error);
    }
  },

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      const decoded = verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.userId).select('+refreshToken');

      if (!user || user.refreshToken !== refreshToken) {
        sendError(res, 'Invalid refresh token', 401);
        return;
      }

      const accessToken = generateAccessToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });
      const newRefreshToken = generateRefreshToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      user.refreshToken = newRefreshToken;
      await user.save({ validateBeforeSave: false });

      sendSuccess(res, { accessToken, refreshToken: newRefreshToken }, 'Token refreshed');
    } catch {
      sendError(res, 'Invalid or expired refresh token', 401);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        await cache.blacklistToken(token, 15 * 60); // 15 minutes
      }

      if (req.user) {
        await User.findByIdAndUpdate(req.user.userId, { $unset: { refreshToken: 1 } });
      }

      sendSuccess(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  },

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await User.findById(req.user!.userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }
      sendSuccess(res, { user });
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, avatar } = req.body;
      const user = await User.findByIdAndUpdate(
        req.user!.userId,
        { name, avatar },
        { new: true, runValidators: true }
      );
      sendSuccess(res, { user }, 'Profile updated');
    } catch (error) {
      next(error);
    }
  },
};
