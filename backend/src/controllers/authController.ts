import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { User } from '../models/User';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { sendVerificationEmail, sendResetPasswordEmail } from '../utils/mailer';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// Zod schemas for validation
const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = signupSchema.parse(req.body);

    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      throw new AppError('An account with this email already exists', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validatedData.password, salt);

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = new User({
      name: validatedData.name,
      email: validatedData.email,
      passwordHash,
      verificationToken,
      verificationTokenExpires,
    });

    const token = generateToken({ userId: user._id.toString(), email: user.email });
    const refreshToken = generateRefreshToken({ userId: user._id.toString(), email: user.email });
    user.refreshToken = refreshToken;

    await user.save();

    // Send verification email (failsafe - non-blocking for user creation)
    try {
      await sendVerificationEmail(user.email, user.name, verificationToken);
    } catch (mailErr) {
      console.error('Mailer failed during signup, continuing user creation', mailErr);
    }

    res.status(201).json({
      status: 'success',
      message: 'Signup successful! Please check your email to verify your account.',
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        isOnboarded: user.isOnboarded,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstMessage = error.errors[0]?.message || 'Validation error';
      return next(new AppError(firstMessage, 400, error.errors));
    }
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await User.findOne({ email: validatedData.email });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(validatedData.password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = generateToken({ userId: user._id.toString(), email: user.email });
    const refreshToken = generateRefreshToken({ userId: user._id.toString(), email: user.email });

    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      status: 'success',
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        isOnboarded: user.isOnboarded,
        onboarding: user.onboarding,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstMessage = error.errors[0]?.message || 'Validation error';
      return next(new AppError(firstMessage, 400, error.errors));
    }
    next(error);
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    if (!token) {
      throw new AppError('Verification token is required', 400);
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new AppError('Invalid or expired verification token', 400);
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully! You can now access all features.',
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new AppError('Email address is required', 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      // For security, don't reveal if user exists. Just return mock success.
      res.status(200).json({
        status: 'success',
        message: 'If an account exists with that email, a reset link has been sent.',
      });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    try {
      await sendResetPasswordEmail(user.email, user.name, resetToken);
    } catch (mailErr) {
      console.error('Mailer failed during forgot password request', mailErr);
    }

    res.status(200).json({
      status: 'success',
      message: 'If an account exists with that email, a reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = resetPasswordSchema.parse(req.body);

    const user = await User.findOne({
      resetPasswordToken: validatedData.token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(validatedData.password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password reset successful! You can now log in with your new password.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('Validation error', 400, error.errors));
    }
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.userId) {
      throw new AppError('Access denied. User session not found.', 401);
    }

    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      status: 'success',
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken: tokenInput } = req.body;
    if (!tokenInput) {
      throw new AppError('Refresh token is required', 400);
    }

    let payload;
    try {
      payload = verifyRefreshToken(tokenInput);
    } catch (err) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const user = await User.findById(payload.userId);
    if (!user || user.refreshToken !== tokenInput) {
      throw new AppError('Refresh token is invalid or has been revoked', 401);
    }

    // Token Rotation
    const newToken = generateToken({ userId: user._id.toString(), email: user.email });
    const newRefreshToken = generateRefreshToken({ userId: user._id.toString(), email: user.email });

    user.refreshToken = newRefreshToken;
    await user.save();

    res.status(200).json({
      status: 'success',
      token: newToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (userId) {
      await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
    }

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};
