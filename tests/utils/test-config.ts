export const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'test@example.com',
  password: process.env.TEST_USER_PASSWORD || 'testpassword123',
  fullName: 'Test User'
};

export const TEST_TIMEOUTS = {
  EMAIL_VERIFICATION: 120000,
  DEFAULT: 30000
};

export const TEST_URLS = {
  MARKETING_PAGE: 'https://hubstaff.com',
  LOGIN_PAGE: 'https://app.hubstaff.com/login',
  PROJECTS_PAGE: 'https://app.hubstaff.com/projects'
}; 