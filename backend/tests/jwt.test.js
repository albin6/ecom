import { generateTokens, verifyAccessToken, verifyRefreshToken } from '../src/utils/jwt.js';

// Setup mock env
jest.mock('../src/config/env.js', () => ({
  env: {
    JWT_SECRET: 'testsecret123',
    JWT_REFRESH_SECRET: 'testrefreshsecret123'
  }
}));

describe('JWT Utilities', () => {
  it('should generate valid access and refresh tokens', () => {
    const userId = '123';
    const role = 'user';
    const { accessToken, refreshToken } = generateTokens(userId, role);

    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();

    const decodedAccess = verifyAccessToken(accessToken);
    expect(decodedAccess.userId).toBe(userId);
    expect(decodedAccess.role).toBe(role);

    const decodedRefresh = verifyRefreshToken(refreshToken);
    expect(decodedRefresh.userId).toBe(userId);
  });
});
