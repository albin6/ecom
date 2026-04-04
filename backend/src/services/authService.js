import { userRepository } from '../repositories/userRepository.js';
import { generateTokens, verifyRefreshToken } from '../utils/jwt.js';
import { emailService } from '../utils/emailService.js';
import crypto from 'crypto';

export class AuthService {
  async register({ name, email, password }) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await userRepository.create({ 
      name, 
      email, 
      password,
      verificationToken: hashedToken,
      verificationTokenExpires: tokenExpires
    });

    // Send email asynchronously without awaiting to not block the response
    emailService.sendVerificationEmail(user.email, verificationToken).catch(console.error);

    const { accessToken, refreshToken } = generateTokens(user._id, user.role);
    await userRepository.updateRefreshToken(user._id, refreshToken);

    return {
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified },
      accessToken,
      refreshToken
    };
  }

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user || !(await user.matchPassword(password))) {
      throw new Error('Invalid email or password');
    }

    const { accessToken, refreshToken } = generateTokens(user._id, user.role);
    await userRepository.updateRefreshToken(user._id, refreshToken);

    return {
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified },
      accessToken,
      refreshToken
    };
  }

  async verifyEmail(token) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await userRepository.findByVerificationToken(hashedToken);

    if (!user) {
      throw new Error('Invalid or expired verification token');
    }

    await userRepository.verifyUser(user._id);
    return { message: 'Email verified successfully' };
  }

  async resendVerification(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    if (user.isVerified) {
      throw new Error('User is already verified');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await userRepository.updateVerificationToken(user.email, hashedToken, tokenExpires);
    emailService.sendVerificationEmail(user.email, verificationToken).catch(console.error);

    return { message: 'Verification email resent' };
  }

  async refresh(token) {
    if (!token) throw new Error('No refresh token provided');
    
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      throw new Error('Invalid or expired refresh token');
    }

    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      throw new Error('User not found');
    }

    const tokens = generateTokens(user._id, user.role);
    await userRepository.updateRefreshToken(user._id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId) {
    await userRepository.clearRefreshToken(userId);
  }
}

export const authService = new AuthService();
