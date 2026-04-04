import express from 'express';
import { register, login, refreshToken, logout, verifyEmail, resendVerification } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many login attempts, please try again later',
});

const resendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3,
  message: 'Too many verification requests, please try again later',
});

router.post('/register', register);
router.post('/login', authLimiter, login);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendLimiter, resendVerification);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

export default router;
