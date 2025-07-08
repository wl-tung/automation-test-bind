/**
 * Authentication fixtures for BiNDup tests
 */

export const authConfig = {
  loginUrl: 'https://mypage.weblife.me/auth/',
  credentials: {
    loginID: '#loginID',
    password: '#loginPass',
    loginButton: 'a.buttonL.btnLogin'
  },
  timeouts: {
    login: 30000,
    navigation: 45000
  }
};

export const testUser = {
  // Test credentials would be loaded from environment variables
  username: process.env.TEST_USERNAME || '',
  password: process.env.TEST_PASSWORD || ''
};
