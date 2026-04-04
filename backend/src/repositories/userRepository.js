import { User } from '../models/User.js';

class UserRepository {
  async create(userData) {
    return await User.create(userData);
  }

  async findByEmail(email) {
    return await User.findOne({ email }).select('+password');
  }

  async findById(id) {
    return await User.findById(id);
  }

  async findByVerificationToken(hashedToken) {
    return await User.findOne({ 
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: Date.now() }
    });
  }

  async verifyUser(userId) {
    return await User.findByIdAndUpdate(userId, { 
      isVerified: true, 
      $unset: { verificationToken: 1, verificationTokenExpires: 1 }
    }, { new: true });
  }

  async updateVerificationToken(email, token, expires) {
    return await User.findOneAndUpdate({ email }, {
      verificationToken: token,
      verificationTokenExpires: expires
    });
  }

  async updateRefreshToken(userId, token) {
    return await User.findByIdAndUpdate(userId, { refreshToken: token });
  }

  async clearRefreshToken(userId) {
    return await User.findByIdAndUpdate(userId, { refreshToken: null });
  }
}

export const userRepository = new UserRepository();
