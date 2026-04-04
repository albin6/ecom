import { protect, admin } from '../src/middlewares/authMiddleware.js';
import { generateTokens } from '../src/utils/jwt.js';

jest.mock('../src/config/env.js', () => ({
  env: {
    JWT_SECRET: 'testsecret',
    JWT_REFRESH_SECRET: 'testsecret'
  }
}));

describe('Auth Middleware', () => {
  let mockRequest;
  let mockResponse;
  let nextFunction;

  beforeEach(() => {
    mockRequest = { headers: {} };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFunction = jest.fn();
  });

  describe('protect', () => {
    it('should call next with an error if no token is provided', async () => {
      await protect(mockRequest, mockResponse, nextFunction);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should call next without error for a valid token', async () => {
      const { accessToken } = generateTokens('user1', 'user');
      mockRequest.headers.authorization = `Bearer ${accessToken}`;
      await protect(mockRequest, mockResponse, nextFunction);
      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user.userId).toBe('user1');
      expect(nextFunction).toHaveBeenCalledWith();
    });
  });

  describe('admin', () => {
    it('should call next without error if user is admin', () => {
      mockRequest.user = { role: 'admin' };
      admin(mockRequest, mockResponse, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should return 403 if user is not admin', () => {
      mockRequest.user = { role: 'user' };
      admin(mockRequest, mockResponse, nextFunction);
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
