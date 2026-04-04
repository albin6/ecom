import { authService } from '../services/authService.js';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const resendSchema = z.object({
  email: z.string().email()
});

export const register = async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await authService.register(data);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400);
      return next(new Error(error.errors[0].message));
    }
    if (error.message === 'User already exists') {
      res.status(400);
      return next(error);
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data);
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400);
      return next(new Error(error.errors[0].message));
    }
    if (error.message === 'Invalid email or password') {
      res.status(401);
      return next(error);
    }
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    if (!token) {
      res.status(400);
      throw new Error('Verification token is missing');
    }
    const result = await authService.verifyEmail(token);
    res.json(result);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

export const resendVerification = async (req, res, next) => {
  try {
    const { email } = resendSchema.parse(req.body);
    const result = await authService.resendVerification(email);
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400);
      return next(new Error(error.errors[0].message));
    }
    res.status(400);
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refresh(refreshToken);
    res.json(tokens);
  } catch (error) {
    res.status(401);
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    if (req.user && req.user.userId) {
      await authService.logout(req.user.userId);
    }
    // Still clear any cookies or respond success to let frontend finish
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    // If it's a 401/403 or search error, we still want to finish
    res.json({ message: 'Logged out with warnings' });
  }
};
